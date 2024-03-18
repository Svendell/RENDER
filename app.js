const express = require('express');
const path = require('path');
const fs = require('fs');
const qs = require('qs');
const handlebars = require('express-handlebars').create({
	defaultLayout: 'main', 
	extname: 'hbs',
	helpers: {
		exit: `document.location='/main'`
	}
});


//#region Настройки
let     app   = express();
const   PORT  = 3000;

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
const publicPath = path.join(__dirname, 'views', 'public');
app.use(express.static(publicPath));
//#endregion



//#region Маршруты
app.get('/', async function(req, res) {
    res.redirect('/main');
    res.end();
});


app.get('/main', async function(req, res) {
	fs.readFile('DB.json', 'utf8', (err, users) => {
		if (err) {console.error(err);return;}
		res.render("main", {users:JSON.parse(users), clickable:false});
	});
});


app.get('/add', async function(req, res) {
	fs.readFile('DB.json', 'utf8', (err, users) => {
		if (err) {console.error(err);return;}
		res.render("add", {users:JSON.parse(users), clickable:true});
	});
});


app.post('/add', async function(req, res) {
	let data = '';
	let filePath = 'DB.json';
	req.on('data', (chunk)=>{
		data += chunk;
	});
	req.on('end', ()=>{
		let DB;
		try {
			DB = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            let newUser = {
                "id" : -1, 
                "name":qs.parse(data)['name'],
                "second_name":qs.parse(data)['second_name'],
                "number":qs.parse(data)['number']
                }
			newUser.id = Number(DB[DB.length - 1].id) + 1;
			DB[DB.length] = newUser;
			DB = JSON.stringify(DB, null, 2);
		} catch (error) {
			console.error('Error reading:', error.message);
		}
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing', err.message);
			} else {
				console.log('/add successfully.');
			}
		});

	})
	res.redirect('/main');
	res.end();
});



app.post('/update', async function(req, res) {
	let data = '';
	let filePath = 'DB.json';
	req.on('data', (chunk)=>{
		data += chunk;
	});
	req.on('end', ()=>{
		let DB;
		try {
			DB = fs.readFileSync(filePath, 'utf8');
			DB = JSON.parse(DB);

            let newUser = {
                "id" : qs.parse(data)['id'],
                "name":qs.parse(data)['name'],
                "second_name":qs.parse(data)['second_name'],
                "number":qs.parse(data)['number']
            }
			for(let i = 0; i < DB.length; i++){
				if(newUser.id == DB[i].id){
					DB[i] = newUser;
				}
			}
			DB = JSON.stringify(DB, null, 2);
		} catch (error) {
			console.error('Error reading:', error.message);
		}

		//запись в json
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing:', err.message);
			} else {
				console.log('/update successfully.');
			}
		});

	})
    res.redirect('/main');
	res.end();
});


app.get('/update', async function(req, res) {
	fs.readFile('DB.json', 'utf8', (err, users) => {
		if (err){
            console.error(err);return;
        }
		let data = JSON.parse(users);
		let usr = data.find((elem)=>elem.id == req.query.id)
		res.render("update.hbs", {
			users:data,
			user:usr, 
			clickable:true
		});
	});
});



app.delete('/delete/:id', async function(req, res) {
	let data = '';
	let filePath = 'DB.json';

	req.on('end', ()=>{
		let DB;
		try {
			DB = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let newUser = {"id" : req.params.id};
			for(let i = 0; i < DB.length; i++){
				if(Number(newUser.id) === Number(DB[i].id)){
					DB.splice(i, 1);
				}
			}
			DB = JSON.stringify(DB, null, 2);
		} catch (error) {
			console.error('Error reading:', error.message);
		}
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing:', err.message);
			} else {
				console.log('/delete/:idsuccessfully.');
			}
		});

	})
	res.redirect('/main');
	res.end();
});
//#endregion

app.listen(PORT, ()=>
 console.log(`Server is running on http://localhost:${PORT}`));


