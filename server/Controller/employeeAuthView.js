module.exports = {

    login:(req, res) => {
        if (req.cookies['token']) {
            res.status(200).redirect('/employee')
        } else {
            res.status(200).render('employeeLogin')
        }
    },

    logout : (req, res) => {
        res.cookie('token', '')
        res.cookie('isAdmin', '')
        res.cookie('authorization', '')
        res.redirect('/employee/login') 
    }
    // register : (req, res) => {
    //     if (req.cookies['token']) {
    //         res.status(200).redirect('/register')
    //     } else {
    
    //         res.status(200).render('signup')
    //     }
    // },
    // logout : (req, res) => {
    //     res.cookie('token', '')
    //     res.cookie('isEmployee', '')
    //     res.redirect('/employee/login')
    // }
    
}