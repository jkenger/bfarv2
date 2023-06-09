const route = require('express').Router()
const admin = require('../Controller/admin')
const adminAuthView = require('../Controller/adminAuthView')
const adminAuth = require('../Controller/adminAuth')
const adminView = require('../Controller/adminView')
const {bearer, checkToken, checkUser, checkRoles, checkApiAuth}  = require('../Middleware/auth')
const { id } = require('date-fns/locale')
const  upload = require('../Middleware/upload')

// authentication endpoints
route.get('/login', adminAuthView.login)
route.get('/register', adminAuthView.register)

route.get('/logout', adminAuthView.logout)

// authentication api
route.post('/login', adminAuth.login_post)

// all
route.get('*', checkUser)   
route.get('/', checkToken, checkRoles, adminView.dashboardView)

// employee endpoints
route.get('/employees',checkToken, checkRoles, adminView.readEmployeesView)
route.get('/employees/new',checkToken, checkRoles, adminView.addEmployeeView)
route.get('/employees/view/:id',checkToken, checkRoles, adminView.viewEmployeeView)
route.get('/employees/edit/:id',checkToken, checkRoles, adminView.editEmployeeView)

//leave endpoints
route.get('/manageLeave/all', checkToken, checkRoles, adminView.allLeaveView)
route.get('/leavetypes', checkToken, checkRoles, adminView.leaveTypesView)

// deduction endpoints
route.get('/deductions', checkToken, checkRoles, adminView.deductionView)

// payroll endpoints
route.get('/payroll/all', checkToken, checkRoles, adminView.payrollView)

route.get('/payroll/groups', checkToken, checkRoles, adminView.payrollTypesView)
route.get('/payroll/history/all', checkToken, checkRoles, adminView.payrollHistoryView)
route.get('/payroll/history/payslips', checkToken, checkRoles, adminView.payslipsView)
route.get('/payroll/history/receipt', checkToken, checkRoles, adminView.payrollHistoryReceiptView)
route.get('/payroll/receipt', checkToken, checkRoles, adminView.payrollReceiptView)
route.get('/payroll/:id/payslip', checkToken, adminView.payslipView)

// record endpoints 
route.get('/attendance/all', checkToken, checkRoles, adminView.attendanceView)
route.get('/attendance/summary', checkToken, checkRoles, adminView.attendanceSummaryView)
route.get('/attendance/history/all', checkToken, checkRoles, adminView.attendanceHistoryView)
route.get('/attendance/history/print', checkToken, checkRoles, adminView.attendancePrintDTRView)
route.get('/attendance/history/print/per-employee', checkToken, checkRoles, adminView.attendancePerEmployeeView)
route.get('/attendance/history/dtr', checkToken, checkRoles, adminView.attendanceHistoryDTRView)
route.get('/attendance/:id/dtr', checkToken, adminView.attendanceDTRView)

// holidays and travel orders endpoint
route.get('/holidays', checkToken, checkRoles, adminView.holidayView)
route.get('/travelpass', checkToken, checkRoles, adminView.travelPassView)

// leave endpoint

// // all
// route.get('*', )
// route.get('/', adminView.home)

// // employee endpoints
// route.get('/employees', adminView.readEmployeesView)
// route.get('/employees/add', adminView.addEmployeeView)
// route.get('/employees/view/:id', adminView.viewEmployeeView)
// route.get('/employees/view/edit', adminView.editEmployeeView)

// // payroll endpoints
// route.get('/payroll', adminView.payroll)

// // record endpoints 
// route.get('/records',  adminView.records)

// [api]

//uploads
route.post('/api/upload-image', upload.single('image'), admin.uploadImage)

// dashboard
route.get('/api/dashboard', admin.dashboard)

// employee api
route.get('/api/employees',  admin.readEmployees)
route.get('/api/employees/:id',  admin.viewEmployee)
route.post('/api/employees', admin.addEmployee)
route.patch('/api/employees/:id',  admin.updateEmployee)

// route.patch('/api/employees/:id/payrollType', admin.updateManyPayrollType)

route.delete('/api/employees/:id',  admin.deleteEmployee)

// deductions
route.get('/api/deductions', admin.readDeductions)
route.post('/api/deductions', admin.addDeduction)
route.delete('/api/deductions/:id', admin.deleteDeduction)
route.patch('/api/deductions/:id', admin.editDeduction)

    // travel orders and official businesses must be retrieve from the admin client,
    // after the client submitted the date and name of the person that was to be excused in that day,
    // the system must create an attendance that write the current order# in am pm

// events | holidays and travel orders api
route.get('/api/events/holidays', admin.readHoliday)
route.post('/api/events/holidays', admin.addHoliday)
route.delete('/api/events/holidays/:id', admin.deleteHoliday)
route.patch('/api/events/holidays/:id', admin.editHoliday)

route.get('/api/events/travelpass', admin.readTravelPass)
route.post('/api/events/travelpass', admin.addTravelPass)
route.delete('/api/events/travelpass/:id', admin.deleteTravelPass)
route.patch('/api/events/travelpass/:id', admin.editTravelPass)

//leave
// route.get('/api/leave', admin.readLeave)

// record api
route.get('/api/attendance/all', admin.readAttendance)
route.get('/api/attendance/per-employee', admin.readAttendancePerEmployee)
route.get('/api/attendance/history', admin.readAttendanceHistory)
route.post('/api/attendance/history', admin.addAttendanceHistory)
route.get('/api/attendance/per-employee/:id', admin.readAttendancePerEmployee)
route.get('/api/attendance/:id', checkApiAuth, admin.readAttendance)



route.get('/api/payrolls/history', admin.readPayrollHistory)
route.post('/api/payrolls/history', admin.addPayrollHistory)

// payroll api
route.get('/api/payrolls', admin.readPayrolls)
route.get('/api/payrolls/:id', checkApiAuth, admin.readPayrolls)


//read
route.get('/api/payrolltypes', admin.readPayrollTypes)
route.get('/api/payrolltypes/:id', admin.readPayrollTypes)

//cud
route.post('/api/payrolltype', admin.addPayrollType)
route.patch('/api/groups/:id', admin.updatePayrollType)
route.delete('/api/groups/:id', admin.deletePayrollType)

//update employee payroll group
route.patch('/api/addtopayrolltype', admin.addEmployeePayrollType)


// leave api
route.get('/api/leave', admin.readLeaveRequests)
route.patch('/api/leave', admin.updateLeaveRequest)
route.get('/api/leave/:id', admin.readLeaveRequests)

//leave types
route.post('/api/leavetypes', admin.addLeaveType)
route.get('/api/leavetypes', admin.readLeaveTypes)
route.patch('/api/leavetypes/:id', admin.updateLeaveType)
route.delete('/api/leavetypes/:id', admin.deleteLeaveType)

//create account    


//accounts

// accounts
route.get('/api/accounts', admin.readAccounts)
route.get('/api/account/:id', admin.readAccount)
route.post('/api/account', admin.createAccount)
// route.delete('/account/:id', checkToken, checkRoles, admin.deleteAccount)



// tests
route.delete('/api/testdelete', admin.testdelete)
route.patch('/api/updateName', admin.updateAttendance)
route.patch('/api/updateTimeout', admin.updateTimeOut)
route.patch('/api/updateUndertime', admin.updateUndertime)



module.exports = route