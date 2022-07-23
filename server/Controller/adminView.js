const { errorHandler, fetchData } = require('./services/services')

const { format } = require('date-fns')
const moment = require('moment')

module.exports = {
    // RENDERER
    home: async (req, res) => {
        try {
            const data = await fetchData('admin/employees_count_get')
            res.status(200).render('Home', { data })
        } catch (err) { res.status(500).send(err) }
    },

    employees: async (req, res) => {
        try {
            const data = await fetchData('admin/employees_get')
            res.status(200).render('Employees', { data })
        } catch (err) { res.status(500).send(err) }
    },

    records: async (req, res) => {
        try {
            const data = await fetchData('admin/records_get')
            res.status(200).render('TimeRecords', { data, moment: moment })
        } catch (err) { res.status(500).send(err) }
    },

    payroll: async (req, res) => {
        try {
            const fromDate = new Date().toISOString()
            const toDate = new Date().toISOString()

            const data = await fetchData(`admin/payroll_get?from=${fromDate}&to=${toDate}`)
            res.status(200).render('Payroll', { data, url: req.url })
            
        } catch (err) { res.status(500).send(err) }
    }
}