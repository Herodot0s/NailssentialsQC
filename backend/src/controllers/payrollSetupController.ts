import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiHelpers';

/**
 * Manager: CRUD for Salary Components
 */
export const getSalaryComponents = async (req: AuthRequest, res: Response) => {
  try {
    const components = await prisma.salaryComponent.findMany({
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, components);
  } catch (error) {
    return sendError(res, 'FETCH_ERROR', 'Failed to fetch salary components');
  }
};

export const createSalaryComponent = async (req: AuthRequest, res: Response) => {
  try {
    const component = await prisma.salaryComponent.create({
      data: req.body,
    });
    return sendSuccess(res, component, 201);
  } catch (error) {
    return sendError(res, 'CREATE_ERROR', 'Failed to create salary component');
  }
};

/**
 * Manager: CRUD for Salary Structures
 */
export const getSalaryStructures = async (req: AuthRequest, res: Response) => {
  try {
    const structures = await prisma.salaryStructure.findMany({
      include: {
        components: {
          include: { salary_component: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, structures);
  } catch (error) {
    return sendError(res, 'FETCH_ERROR', 'Failed to fetch salary structures');
  }
};

export const createSalaryStructure = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, is_active, components } = req.body;

    const structure = await prisma.$transaction(async (tx) => {
      const newStructure = await tx.salaryStructure.create({
        data: { name, description, is_active },
      });

      if (components && components.length > 0) {
        await tx.salaryStructureComponent.createMany({
          data: components.map((c: any) => ({
            salary_structure_id: newStructure.id,
            salary_component_id: c.salary_component_id,
            amount: c.amount,
            formula: c.formula,
          })),
        });
      }

      return tx.salaryStructure.findUnique({
        where: { id: newStructure.id },
        include: { components: true },
      });
    });

    return sendSuccess(res, structure, 201);
  } catch (error) {
    return sendError(res, 'CREATE_ERROR', 'Failed to create salary structure');
  }
};

/**
 * Manager: Salary Structure Assignments
 */
export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.salaryStructureAssignment.findMany({
      include: {
        staff: { select: { full_name: true } },
        salary_structure: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return sendSuccess(res, assignments);
  } catch (error) {
    return sendError(res, 'FETCH_ERROR', 'Failed to fetch assignments');
  }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { staff_id, salary_structure_id, base_pay, effective_from } = req.body;

    // Deactivate previous assignments for this staff
    await prisma.salaryStructureAssignment.updateMany({
      where: { staff_id, is_active: true },
      data: { is_active: false },
    });

    const assignment = await prisma.salaryStructureAssignment.create({
      data: {
        staff_id,
        salary_structure_id,
        base_pay,
        effective_from: new Date(effective_from),
        is_active: true,
      },
    });

    return sendSuccess(res, assignment, 201);
  } catch (error) {
    return sendError(res, 'CREATE_ERROR', 'Failed to create assignment');
  }
};
