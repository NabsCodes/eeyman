const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('home', { title: 'Home' });
});

router.get('/about', (req, res) => {
	res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
	res.render('contact', { title: 'Contact' });
});

router.get('/gallery', (req, res) => {
	res.render('gallery', { title: 'Gallery' });
});

router.get('/gallery-single', (req, res) => {
	res.render('gallery-single', { title: 'Gallery-Single' });
});

router.get('/services', (req, res) => {
	res.render('services', { title: 'Services' });
});

module.exports = router;
