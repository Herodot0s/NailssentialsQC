# System Revisions & Pending Tasks

This document tracks all system revisions requested after manual and manager's testing. These items are categorized for future implementation and should not be implemented until formally planned.

## General UI & Information
- In address 133 put D on it.
- Change "Opening Hours" to "Operating Hours".
- Add Socials: Facebook, Instagram.
- Add AI generated images for each service.
- Improve the manager's dashboard by dismissing the system color and colorize it for the sake of visual quality. Don't use the main website color palette, elements, and style in the manager's dashboard. The design priority should pour all in usability and visual quality (needs to be productive and professional).

## Services Updates
- Remove Hair and Eyelash Services.
- Fix menu: only put Nails and Add-ons on nails, Hand spa and foot spa, Waxing & Threading. Remove the rest.
- Remove the time specification in each service.

## Appointment Module Updates
- Test Appointment module. Research how appointment booking works in Online Appointment and Walk-ins appointment (Staff Input) -> check what the appointment system is lacking.
- The set time in appointment for customer, all services should be the same time.
- Remove Specialization in Appointment.
- User can choose custom time of their appointment but still have predetermined time (30 mins interval like 1:00 -> 1:30) but make sure it aligns with the store operating hours.
- In Booking an appointment, the user should have a verified email. (Research how to implement email verification in the system, add security measures for email to check if it's fake or real).
- Customer can rate staff after a successful appointment/service.

## Manager Dashboard & Staff Management
- Check the staff schedule CRUD for the manager, if it's lacking -> research -> fill the lacking -> test.
- The Manager's dashboard for revenue should only have 2 categories: Nails and Waxing only. Each should be expandable: when "Nails" is clicked, it shows all services statistics for nails. Do that as well for "Waxing".
- Add Edit functionality in Exhibit.

## HR & Payroll (Research & Implementation)
- In Employee Files, the Compliance should be Pag-ibig number and SSS for Staff. Remove TIN number.
- In deductions, that should be weekly deductions. Research on how the manager will add deductions to the staff weekly. Research -> plan -> implement.
- Research how weekly payout for staff should be edited and made by the manager. Research -> plan -> implement.
- Research modules of https://github.com/frappe/hrms that are relevant to our system (like the payroll) to improve overall operations.
- Research other open-source modules that are relevant to our system.