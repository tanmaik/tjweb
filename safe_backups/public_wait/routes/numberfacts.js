const express = require('express');
const router = express.Router({strict:true})

router.get('/numberfacts', function(req, res) {
    res.render('numberfacts_default')
})

router.get('/numberfacts/:number', function(req, res) {
    var facts = [[], ['1 > 0', 'You have one nose', "All numbers are divisible by 1!"],
    ['You have 2 eyes', 'You have 2 ears', '2 + 2 = 4'],
    ['Three rhymes with tree', 'If you put 2 3\'s together, it makes an 8', '3 < infinity'],
    ['The number 4 makes a triangle', 'Dogs walk on 4 legs', 'and so do most other mammals']]
    
    numfacts = req.query.num_facts
    number = parseInt(req.params.number)
 
    if (numfacts !== undefined) {
            if (parseInt(numfacts) > 3 || parseInt(numfacts) < 1) {
                numfacts = 3
            } else {
                facts[number].length = numfacts
            }
    }
    if (number > 4 || number < 1 || isNaN(number)) {
        res.send('Please choose a number between 1 and 4.')
    }
    
    var params = {
        'number': number,
        'facts': facts[number]
    }
    
    if (req.query.format == 'json') {
        res.json(params)
    }
    
    res.render('numberfacts', params)
    
})

module.exports = router;