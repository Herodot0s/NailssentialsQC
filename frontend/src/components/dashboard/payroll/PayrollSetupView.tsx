import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';
import {
  getSalaryComponents,
  createSalaryComponent,
  getSalaryStructures,
  createSalaryStructure,
  getAssignments,
  createAssignment,
  getAllStaff,
} from '@/api/apiClient';

const PayrollSetupView: React.FC = () => {
  const [components, setComponents] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [, setIsLoading] = useState(false);

  // Form states
  const [showCompDialog, setShowCompDialog] = useState(false);
  const [compForm, setCompForm] = useState({ name: '', type: 'earning', description: '' });

  const [showStructDialog, setShowStructDialog] = useState(false);
  const [structForm, setStructForm] = useState({
    name: '',
    description: '',
    selectedComponents: [] as any[],
  });

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignForm, setAssignForm] = useState({
    staff_id: '',
    salary_structure_id: '',
    base_pay: '',
    effective_from: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [compRes, structRes, assignRes, staffRes] = await Promise.all([
        getSalaryComponents(),
        getSalaryStructures(),
        getAssignments(),
        getAllStaff(),
      ]);
      if (compRes.data.success) setComponents(compRes.data.data);
      if (structRes.data.success) setStructures(structRes.data.data);
      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (staffRes.data.success) {
        const staffData = staffRes.data.data;
        setStaffMembers(Array.isArray(staffData) ? staffData : staffData?.items || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSalaryComponent(compForm);
      setShowCompDialog(false);
      setCompForm({ name: '', type: 'earning', description: '' });
      fetchData();
    } catch (error) {
      alert('Failed to create component');
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSalaryStructure({
        name: structForm.name,
        description: structForm.description,
        components: structForm.selectedComponents.map((c) => ({
          salary_component_id: c.id,
          amount: c.amount || 0,
          formula: c.formula || '',
        })),
      });
      setShowStructDialog(false);
      setStructForm({ name: '', description: '', selectedComponents: [] });
      fetchData();
    } catch (error) {
      alert('Failed to create structure');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment({
        staff_id: parseInt(assignForm.staff_id),
        salary_structure_id: parseInt(assignForm.salary_structure_id),
        base_pay: parseFloat(assignForm.base_pay),
        effective_from: new Date(assignForm.effective_from).toISOString(),
      });
      setShowAssignDialog(false);
      fetchData();
    } catch (error) {
      alert('Failed to create assignment');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-1">
            Configuration
          </p>
          <h2 className="font-serif text-3xl font-light text-foreground italic">
            Payroll Architecture
          </h2>
        </div>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-12 p-0 gap-8">
          <TabsTrigger
            value="components"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] uppercase tracking-widest font-bold px-0 h-full"
          >
            Components
          </TabsTrigger>
          <TabsTrigger
            value="structures"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] uppercase tracking-widest font-bold px-0 h-full"
          >
            Structures
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] uppercase tracking-widest font-bold px-0 h-full"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="components"
          className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Salary Components
            </h3>
            <Button
              onClick={() => setShowCompDialog(true)}
              size="sm"
              className="rounded-none h-10 px-6 text-[10px] uppercase tracking-widest font-bold"
            >
              <Plus className="h-3 w-3 mr-2" /> Add Component
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((c) => (
              <Card
                key={c.id}
                className="rounded-none border-gray-100 shadow-none hover:border-primary/20 transition-all group"
              >
                <CardHeader className="p-5 pb-2">
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 ${c.type === 'earning' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {c.type}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-serif italic mt-2">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {c.description || 'No description provided'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {showCompDialog && (
            <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <Card className="w-full max-w-md rounded-none border-none shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-2xl italic">New Component</CardTitle>
                    <button onClick={() => setShowCompDialog(false)}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <form onSubmit={handleCreateComponent} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Name
                      </Label>
                      <Input
                        value={compForm.name}
                        onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                        className="rounded-none h-12"
                        placeholder="e.g. Health Insurance"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Type
                      </Label>
                      <select
                        className="w-full h-12 border border-input bg-background px-3 py-2 text-sm rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={compForm.type}
                        onChange={(e) => setCompForm({ ...compForm, type: e.target.value })}
                      >
                        <option value="earning">Earning</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Description
                      </Label>
                      <Input
                        value={compForm.description}
                        onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                        className="rounded-none h-12"
                        placeholder="Brief explanation..."
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                      Create Component
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="structures"
          className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Salary Structures
            </h3>
            <Button
              onClick={() => setShowStructDialog(true)}
              size="sm"
              className="rounded-none h-10 px-6 text-[10px] uppercase tracking-widest font-bold"
            >
              <Plus className="h-3 w-3 mr-2" /> Define Structure
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {structures.map((s) => (
              <Card key={s.id} className="rounded-none border-gray-100 shadow-none">
                <CardHeader className="p-6 border-b border-gray-50">
                  <CardTitle className="font-serif text-xl italic">{s.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">
                      Components Defined
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.components.map((sc: any) => (
                        <div
                          key={sc.id}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-none"
                        >
                          <span className="text-xs font-medium">{sc.salary_component.name}</span>
                          <span className="text-[9px] text-muted-foreground italic">
                            {sc.formula ? `[${sc.formula}]` : `₱${sc.amount}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {showStructDialog && (
            <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl rounded-none border-none shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="p-8 pb-4 border-b border-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-2xl italic">Define Structure</CardTitle>
                    <button onClick={() => setShowStructDialog(false)}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 max-h-[70vh] overflow-y-auto">
                  <form onSubmit={handleCreateStructure} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          Structure Name
                        </Label>
                        <Input
                          value={structForm.name}
                          onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
                          className="rounded-none h-12"
                          placeholder="e.g. Standard Full-time"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          Description
                        </Label>
                        <Input
                          value={structForm.description}
                          onChange={(e) =>
                            setStructForm({ ...structForm, description: e.target.value })
                          }
                          className="rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Select & Configure Components
                      </Label>
                      <div className="space-y-3">
                        {components.map((comp) => {
                          const isSelected = structForm.selectedComponents.find(
                            (c) => c.id === comp.id,
                          );
                          return (
                            <div
                              key={comp.id}
                              className={`border p-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={!!isSelected}
                                    onChange={() => {
                                      if (isSelected) {
                                        setStructForm({
                                          ...structForm,
                                          selectedComponents: structForm.selectedComponents.filter(
                                            (c) => c.id !== comp.id,
                                          ),
                                        });
                                      } else {
                                        setStructForm({
                                          ...structForm,
                                          selectedComponents: [
                                            ...structForm.selectedComponents,
                                            { id: comp.id, amount: '', formula: '' },
                                          ],
                                        });
                                      }
                                    }}
                                  />
                                  <div>
                                    <p className="text-sm font-bold">{comp.name}</p>
                                    <p className="text-[9px] uppercase font-black text-muted-foreground">
                                      {comp.type}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="flex gap-2 flex-1 max-w-sm">
                                    <Input
                                      placeholder="Amount"
                                      className="h-9 rounded-none text-xs"
                                      value={isSelected.amount}
                                      onChange={(e) => {
                                        const newSelected = structForm.selectedComponents.map(
                                          (c) =>
                                            c.id === comp.id ? { ...c, amount: e.target.value } : c,
                                        );
                                        setStructForm({
                                          ...structForm,
                                          selectedComponents: newSelected,
                                        });
                                      }}
                                    />
                                    <Input
                                      placeholder="Formula (e.g. base * 0.1)"
                                      className="h-9 rounded-none text-xs"
                                      value={isSelected.formula}
                                      onChange={(e) => {
                                        const newSelected = structForm.selectedComponents.map(
                                          (c) =>
                                            c.id === comp.id
                                              ? { ...c, formula: e.target.value }
                                              : c,
                                        );
                                        setStructForm({
                                          ...structForm,
                                          selectedComponents: newSelected,
                                        });
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                      Save Structure
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="assignments"
          className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Staff Assignments
            </h3>
            <Button
              onClick={() => setShowAssignDialog(true)}
              size="sm"
              className="rounded-none h-10 px-6 text-[10px] uppercase tracking-widest font-bold"
            >
              <Plus className="h-3 w-3 mr-2" /> New Assignment
            </Button>
          </div>

          <div className="border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                    Employee
                  </th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                    Structure
                  </th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                    Base Pay
                  </th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                    Effective From
                  </th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-sm font-bold">{a.staff.full_name}</td>
                    <td className="p-4 text-sm italic">{a.salary_structure.name}</td>
                    <td className="p-4 text-sm font-mono">
                      ₱{Number(a.base_pay).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(a.effective_from).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[8px] uppercase font-black px-2 py-0.5 ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {a.is_active ? 'Active' : 'Superseded'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAssignDialog && (
            <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <Card className="w-full max-w-md rounded-none border-none shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-2xl italic">Assign Structure</CardTitle>
                    <button onClick={() => setShowAssignDialog(false)}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <form onSubmit={handleCreateAssignment} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Select Employee
                      </Label>
                      <select
                        className="w-full h-12 border border-input bg-background px-3 py-2 text-sm rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={assignForm.staff_id}
                        onChange={(e) => setAssignForm({ ...assignForm, staff_id: e.target.value })}
                        required
                      >
                        <option value="">Choose Employee...</option>
                        {staffMembers.map((s) => (
                          <option key={s.id} value={s.staffProfileId}>
                            {s.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Select Structure
                      </Label>
                      <select
                        className="w-full h-12 border border-input bg-background px-3 py-2 text-sm rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={assignForm.salary_structure_id}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, salary_structure_id: e.target.value })
                        }
                        required
                      >
                        <option value="">Choose Structure...</option>
                        {structures.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Base Weekly Pay
                      </Label>
                      <Input
                        type="number"
                        value={assignForm.base_pay}
                        onChange={(e) => setAssignForm({ ...assignForm, base_pay: e.target.value })}
                        className="rounded-none h-12"
                        placeholder="e.g. 2500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Effective From
                      </Label>
                      <Input
                        type="date"
                        value={assignForm.effective_from}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, effective_from: e.target.value })
                        }
                        className="rounded-none h-12"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                      Confirm Assignment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollSetupView;
