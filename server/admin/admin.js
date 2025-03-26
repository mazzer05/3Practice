const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

app.use(bodyParser.json());

const productsPath = path.join(__dirname, '../products.json');

app.get('/products', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    res.json(products);
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});
app.post('/products', (req, res) => {
    try {
        // Читаем текущие товары
        let products = [];
        try {
            const data = fs.readFileSync(productsPath, 'utf-8');
            products = JSON.parse(data);
        } catch (readErr) {
            console.error('Ошибка чтения файла:', readErr);
            products = [];
        }

        // Валидация данных
        if (!req.body.name || !req.body.price || !req.body.categories) {
            return res.status(400).json({ error: 'Недостаточно данных' });
        }

        // Создаем новый товар
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: req.body.name.toString(),
            price: parseFloat(req.body.price),
            description: req.body.description?.toString() || '',
            categories: Array.isArray(req.body.categories) 
                ? req.body.categories.map(c => c.toString())
                : req.body.categories.split(',').map(c => c.trim())
        };

        // Добавляем товар
        products.push(newProduct);

        // Записываем в файл
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf-8');
        
        console.log('Успешно добавлен товар:', newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Ошибка при добавлении товара:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
});

app.put('/products/:id', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        res.json(products[index]);
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

app.delete('/products/:id', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        res.json(deletedProduct);
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

app.listen(port, () => {
    console.log(`Admin server running at http://localhost:${port}`);
});

