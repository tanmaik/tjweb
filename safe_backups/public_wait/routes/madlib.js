const express = require('express');
const router = express.Router({ strict: true })


router.get('/ml_form', function(req, res) {
    res.render('formtemplate')
});

router.get('/madlib', function(req, res){
    const {f_name, f_birthplace, f_pet, f_food, f_cool} = req.query
    coolness = "is cool"
    if (!f_cool) {
        coolness = "is not cool"
        
    }
    var params = {
        'name': f_name,
        'place': f_birthplace,
        'pet': f_pet,
        'food': f_food,
        'cool': coolness
    }
    res.render('madlib', params);
});

module.exports = router;
