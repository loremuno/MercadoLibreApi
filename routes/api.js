var express = require('express');
var router = express.Router();
const https = require("https");

class Item {
    constructor(id, title, currency, amount, decimals, picture, condition, free_shipping) {
        this.id = id;
        this.title = title;
        this.price = {
            currency: currency,
            amount: amount,
            decimals: decimals,
        }
        this.picture = picture;
        this.condition = condition;
        this.free_shipping = free_shipping;
    }
}

class Author {
    constructor(name, lastname) {
        this.name = name;
        this.lastname = lastname;
    }
}


class Results {
    constructor(author, categories, items) {
        this.author = author;
        this.categories = categories;
        this.items = items;
    }
}

let author = new Author("Lorenzo", "Muñoz");

router.get('/', function (req, res) {
    res.send('Api home page');
})

router.get('/items/:id', function (req, res) {
    let datos = '';
    https.get('https://api.mercadolibre.com/items/' + req.params.id, (response) => {
        response.on('data', (d) => {
            datos = datos + d.toString();
        });
        response.on('end', () => {
            let data = JSON.parse(datos);
            let item = new Item(data.id, data.title, data.currency_id, data.price, 2, data.thumbnail, data.condition, data.shipping.free_shipping);
            res.send({ author: author, item: item });
        });
    }).on('error', (e) => {
        console.error(e);
    });
})

router.get('/items/:id/description', function (req, res) {
    let datos = '';
    https.get('https://api.mercadolibre.com/items/' + req.params.id + '/description', (response) => {
        response.on('data', (d) => {
            datos = datos + d.toString();
        });
        response.on('end', () => {
            let data = JSON.parse(datos);
            res.send({ description: data.plain_text });
        });
    }).on('error', (e) => {
        console.error(e);
    });
})

router.get('/items', function (req, res) {
    let datos = '';
    let items = [Item];
    let categorias = [String];
    https.get('https://api.mercadolibre.com/sites/MLA/search?q=' + req.query.q, (response) => {
        response.on('data', (d) => {
            datos = datos + d.toString();
        });
        response.on('end', () => {
            let data = JSON.parse(datos);
            data.results.forEach(element => {
                let item = new Item(element.id, element.title, element.currency_id, element.price, 2, element.thumbnail, element.condition, element.shipping.free_shipping);
                items.push(item);
            });
            data.available_filters.forEach(element => {
                if (element.id == "category") {
                    element.values.forEach(elementCategory => {
                        if (elementCategory.name) {
                            categorias.push(elementCategory.name);
                        }
                    });
                }
            });
            res.send(new Results(author, categorias, items));
        });
    }).on('error', (e) => {
        console.error(e);
    });
})

module.exports = router;

