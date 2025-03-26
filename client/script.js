document.addEventListener('DOMContentLoaded', () => {
    // Функция для выполнения GraphQL запросов
    async function fetchGraphQL(query, variables = {}) {
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });
        return await response.json();
    }

    // Загрузка товаров (только названия и цены)
    async function loadProductsNamesAndPrices() {
        const query = `
            query {
                productNamesWithPrices {
                    name
                    price
                }
            }
        `;
        
        const result = await fetchGraphQL(query);
        displayProducts(result.data.productNamesWithPrices);
    }

    // Загрузка полной информации о товарах
    async function loadFullProducts() {
        const query = `
            query {
                products {
                    id
                    name
                    price
                    description
                    categories
                }
            }
        `;
        
        const result = await fetchGraphQL(query);
        displayProducts(result.data.products);
    }

    // Отображение товаров
    function displayProducts(products) {
        const productsContainer = document.getElementById('products');
        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product';
            
            // Проверяем, есть ли полная информация или только имя и цена
            if (product.description && product.categories) {
                productCard.innerHTML = `
                    <h2>${product.name}</h2>
                    <p>Цена: ${product.price} руб.</p>
                    <p>${product.description}</p>
                    <p>Категории: ${product.categories.join(', ')}</p>
                `;
            } else {
                productCard.innerHTML = `
                    <h2>${product.name}</h2>
                    <p>Цена: ${product.price} руб.</p>
                `;
            }
            
            productsContainer.appendChild(productCard);
        });
    }

    // Кнопки для разных запросов
    const controls = document.createElement('div');
    controls.innerHTML = `
        <button id="loadNamesPrices">Показать только названия и цены</button>
        <button id="loadFullInfo">Показать полную информацию</button>
    `;
    document.body.insertBefore(controls, document.getElementById('products'));

    // Обработчики кнопок
    document.getElementById('loadNamesPrices').addEventListener('click', loadProductsNamesAndPrices);
    document.getElementById('loadFullInfo').addEventListener('click', loadFullProducts);

    // Загружаем по умолчанию только названия и цены
    loadProductsNamesAndPrices();
});