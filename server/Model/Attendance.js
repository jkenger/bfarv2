const e = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const moment = require('moment')
const Employees = require('./employee')


const EMP_TIME_RECORD = mongoose.Schema({
    emp_code: {
        type: String,
        ref: "Employees",
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Employee ID was not found'],
        ref: 'Employees'
    },
    name:{
        type: String,
    },
    date: {
        type: Date
    },
    date_string: {
        type: String,
    },
    am_time_in: {
        type: Date
    },
    am_time_out: {
        type: Date
    },
    pm_time_in: {
        type: Date
    },
    pm_time_out: {
        type: Date
    },
    duration: {
        type: Number
    },
    am_office_in: {
        type: Date
    },
    pm_office_in: {
        type: Date
    },
    am_office_out: {
        type: Date
    },
    pm_office_out: {
        type: Date
    },
    offset: {
        type: Number
    },
    isLate: {
        type: Boolean
    },
    isUndertime: {
        type: Boolean,
        default: false
    },
    isHalf: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: "Office"
    }
})
// TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.timeIn = async function (emp_code, _id, time_type) {

    // VARIABLES--------------------------------------------------------

    // OFFICE ISO DATE AND TIME
    const officeISODate = new Date().toISOString().split('T')[0]; // current date || yyyy-mm-dd
    console.log(officeISODate)
    const testISODate = '2022-12-29'; // current date for tioday|| yyyy-mm-dd (ie 2022-09-27)
    console.log(officeISODate)
    
    const db_ISO_AM_END = officeISODate + 'T12:00:00.000Z'
    const db_ISO_PM_END = officeISODate + 'T09:00:00.000Z'
    const db_ISO_AM_START = officeISODate + 'T00:00:00.000Z'
    const db_ISO_PM_START = officeISODate + 'T05:00:00.000Z'
    
    // 8 AM TIME IN
    const OFFICE_AM_START = testISODate + 'T08:00:00.000Z';
    const OFFICE_ISO_AM_START = new Date(OFFICE_AM_START)

    // 12 PM  AM-TIME OUT
    
    const OFFICE_AM_END = testISODate + 'T12:00:00.000Z';
    const OFFICE_ISO_AM_END = new Date(OFFICE_AM_END)

    // 12:45 PM 
    const OFFICE_PM_START = testISODate + 'T12:45:00.000Z';
    const OFFICE_ISO_PM_START = new Date(OFFICE_PM_START)

    // 1 PM OFFICIAL PM START
    
    const OFFICE_OFF_PM_START = testISODate + 'T13:00:00.000Z';
    const OFFICE_ISO_OFF_PM_START = new Date(OFFICE_OFF_PM_START)

    // 5PM OUT
    const OFFICE_PM_END = testISODate + 'T17:00:00.000Z';
    const OFFICE_ISO_PM_END = new Date(OFFICE_PM_END)

    console.log(testISODate + OFFICE_PM_END)

    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date() // FOR DATABASE STORING
    const currentLocalISODate = currentISODate.getTime() - new Date().getTimezoneOffset() * 60 * 1000 // FOR TIME COMPARISON


    // CURRENT DATE STRING
    const currentDateString = new Date().toLocaleDateString()

    //-------------------------------------------------------------------
    
    // TIME-IN STARTS HERE ----------------------------------------------
    if (time_type === 'timein') {
        
        if(currentLocalISODate > OFFICE_ISO_PM_END){
            throw Error('Office hour ended')
        }

        //  AM TIME FRAME
        if (currentLocalISODate < OFFICE_ISO_AM_END) {
            console.log(currentLocalISODate < OFFICE_ISO_AM_END, currentLocalISODate, OFFICE_ISO_AM_END)
            // FIND ID WHERE THERE IS NO RECORD WITHIN TEH DAY
            const status = await this.find({
                emp_code: emp_code,
                date_string: currentDateString,
            })
            // LOG
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            // NOTE: date should be formatted to local date.
            console.log('ASDASD', status)
            if (!status.length) {
                const employee = await Employees.findOne({emp_code: emp_code}).select('name')
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    name: employee.name,
                    date: currentLocalISODate,
                    date_string: currentDateString,
                    am_office_in: db_ISO_AM_START,
                    am_office_out: db_ISO_AM_END,
                    am_time_in: currentISODate,
                    am_time_out: '',
                    pm_office_in: db_ISO_PM_START,
                    pm_office_out: db_ISO_PM_END,  
                    pm_time_in: '',
                    pm_time_out: '',
                    offset: new Date().getTimezoneOffset(),
                    isLate: false
                })
                if(currentLocalISODate > OFFICE_ISO_AM_START){
                    console.log('AM IS LATE: **LATE**')
                    await this.findOneAndUpdate({ 
                        emp_code: emp_code,
                        date_string: currentDateString
                    },{isLate: true})
                }
                console.log(currentISODate)
                return result
            }else { throw Error('You have already logged in for morning shift') }
        }

        // IF LATE

        // 12 PM STARTS HERE
        if (currentLocalISODate > OFFICE_ISO_AM_END) {
            console.log(currentLocalISODate > OFFICE_ISO_AM_END, currentLocalISODate, OFFICE_ISO_AM_END)
            console.log('AFTER 12 PM')

            // FIND RECORD WHERE AM TIME-IN IS EMPTY
            const status = await this.find(
                { emp_code: emp_code, date_string: currentDateString }
            )
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            if (!status.length) {
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    date: db_ISO_AM_START,
                    date_string: currentDateString,
                    am_office_in: db_ISO_AM_START,
                    am_office_out: db_ISO_AM_END, 
                    am_time_in: '',
                    am_time_out: '',
                    pm_office_in: db_ISO_PM_START,
                    pm_office_out: db_ISO_PM_END, 
                    pm_time_in: currentISODate,
                    pm_time_out: '',
                    offset: new Date().getTimezoneOffset(),
                    isLate: false
                })
                // IF LATE
                if(currentLocalISODate > OFFICE_ISO_OFF_PM_START){
                    console.log(currentLocalISODate > OFFICE_ISO_OFF_PM_START, currentLocalISODate, OFFICE_ISO_OFF_PM_START)
                    console.log('PM IS LATE: **LATE**')
                    await this.findOneAndUpdate({ 
                        emp_code: emp_code,
                        date_string: currentDateString},
                        {isLate: true})
                }
                return result

                // IF STATUS RETURNED 1, UPDATE EXISTING
            } else {
                const status = await this.find({ emp_code: emp_code, date_string: currentDateString })
                
                const result = await this.findOneAndUpdate(
                    {emp_code: emp_code, date_string: currentDateString,
                     am_time_in: { $ne: '' }, pm_time_in: ''},
                    // UPDATE PM TIME-IN AND AM TIME-OUT // DO NOT OVERWRITE AM TIME OUT IF EXIST
                    (status[0].am_time_out)
                    ? { pm_time_in: currentISODate,  pm_time_out: ''}
                    : {am_time_out: currentISODate, pm_time_in: currentISODate, pm_time_out: '' }
                )

                

                // THROW AN ERROR 
                if (!result) { throw Error('You have already logged in for afternoon shifts') }
                return result
            }

        }
    }
    // TIME-IN ENDS HERE-------------------------------------------------------------------


    // TIME OUT STARTS HERE ---------------------------------------------------------------
    if (time_type === 'timeout') {
        console.log(new Date())

        // if employee punch out under official am end. mark as undertime
        if (currentLocalISODate <= OFFICE_ISO_OFF_PM_START) {
            if(currentLocalISODate < OFFICE_ISO_AM_END){
                await this.findOneAndUpdate({ 
                    emp_code: emp_code,
                    date_string: currentDateString
                },{isUndertime: true})
            }
            // fetch records for am
            const status = await this.find({
                emp_code: emp_code, date_string: currentDateString,
                am_time_in: { $ne: '' }, am_time_out: ''
            });
            console.log('Attendee outz', status)

            // if there is existing record, update whether employee is half, or not.
            if (status.length) {
                let filter, update;
                if(!status[0].pm_time_in && !status[0].pm_time_out) filter = { emp_code: emp_code, date_string: currentDateString }, update = { am_time_out: currentISODate, isHalf: true };
                else filter = { emp_code: emp_code, date_string: currentDateString }, update = { am_time_out: currentISODate, isHalf: false };
                
                console.log(filter, update)
                const result = await this.findOneAndUpdate(filter, update) // UPDATE
                return result
            }else {
                throw Error('Next shift will start at 1:00 PM')
            }

        }

        if (currentLocalISODate >= OFFICE_ISO_PM_START) { 
            // FIND IF HAS RECORD
            if(currentLocalISODate < OFFICE_ISO_PM_END){
                await this.findOneAndUpdate({ 
                    emp_code: emp_code,
                    date_string: currentDateString
                },{isUndertime: true})
            }

            const status = await this.find({
                emp_code: emp_code, date_string: currentDateString,
                pm_time_in: { $ne: '' }, pm_time_out: ''
            });

            console.log('Attendee outs', status)
            
            // IF THERE IS, UPDATE THE DOCUMENT
            if (status.length === 1) {
                // QUERY
                let filter, update;
                // IF AM TIME IN AND OUT IS NULL AND PM TIME IN
                if(!status[0].am_time_in && !status[0].am_time_out) filter = { emp_code: emp_code, date_string: currentDateString }, update = { pm_time_out: currentISODate, isHalf: true };
                else filter = { emp_code: emp_code, date_string: currentDateString }, update = { pm_time_out: currentISODate, isHalf: false };
                // FIND AND UPDATE
                const result = await this.findOneAndUpdate(filter, update)
                return result
            } else {
                throw Error('Afternoon shift ended')
            }
        }

    }
    // TIME-OUT ENDS HERE------------------------------------------------------------
}

EMP_TIME_RECORD.pre('save', async function(){
    console.log(this)
    if((!this.am_time_in && !this.am_time_out) || (!this.pm_time_in && !this.pm_time_out)){
        this.isHalf = false;
    }else{
        this.isHalf = true;
    }
})

// GET ALL ATTENDANCE INFORMATION
EMP_TIME_RECORD.statics.getAttendanceData = async function(){
    const result = await this.find({})
    return result
}

EMP_TIME_RECORD.statics.getSelectedAttendanceData = async function(){
    const pipeline = [
        {$match: {}},
        {$project: {
            emp_code: 1,
            name: 1,
            am: {
                am_time_in: '$am_time_in',
                am_time_out: '$am_time_out',
            },
            pm: {
                pm_time_in: '$pm_time_in',
                pm_time_out: '$pm_time_out',
            },
            message: 1
        }},        
    ]
    const result = await this.aggregate(pipeline)
    return result
}

// GET TOTAL DATAS
EMP_TIME_RECORD.statics.getTotalData = async function(){
    const pipeline = [
        {$match: {}},
        {$project: {
            emp_code: 1,
            name: 1,
            am: {
                time_in: '$am_time_in',
                time_out: '$am_time_out',
            },
            pm: {
                time_in: '$pm_time_in',
                time_out: '$pm_time_out',
            },
            message: 1,
            isLate: 1,
            totals:{
                present: {$cond:
                    // IF TIME INS AND OUT IS NOT NULL PR MESSAGE IS NOT EQUAL TO 'OFFICE', 
                    {if: {$or:[
                        {$and: [
                            {$ne:['$am_time_in', null]},
                            {$ne:['$am_time_out', null]},
                            {$ne:['$pm_time_in', null]},
                            {$ne:['$pm_time_out', null]},
                        ]}, 
                        {$ne:['$message', 'Office']}
                        ]},
                    then: {$sum: 1},
                    else: {$sum: 0}
                    }
                },
                absent:{$cond:
                    // IF TIME INS AND OUT IS NOT NULL PR MESSAGE IS NOT EQUAL TO 'OFFICE', 
                    {if: {$or:[
                        {$and: [
                            {$ne:['$am_time_in', null]},
                            {$ne:['$am_time_out', null]},
                            {$ne:['$pm_time_in', null]},
                            {$ne:['$pm_time_out', null]},
                        ]}, 
                        {$ne:['$message', 'Office']}
                        ]},
                    then: {$sum: 0},
                    else: {$sum: 1}
                    }
                },
                lates: {$cond: {
                    if: {$eq: ['$isLate', true]},
                    then: {$sum: 1},
                    else: {$sum: 0}
                }}
            }
            
        }},
        
        {$group:{
            _id: null,
            presents: {$sum: '$totals.present'},
            absents: {$sum: '$totals.absent'},
            lates: {$sum: '$totals.lates'}
        }}
    ]
    const result = await this.aggregate(pipeline)
    return result
}

const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;