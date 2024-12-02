const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');
const path = require('path');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

let db;
app.use(express.static('static'));

(async () => {
  db = await open({
    filename: path.join(__dirname,'database.sqlite'),
    driver: sqlite3.Database,
  });
})();

app.get('/restaurants', async (req, res) => {
  try {
    let result = await fetchAllRestaurants();
    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
async function fetchAllRestaurants() {
  let query = 'SELECT * from restaurants';
  let response = await db.all(query, []);

  return { restaurants: response };
}

///restaurants/cuisine/Indian
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  try {
    let cuisine = req.params.cuisine;
    let result = await getRestaurantsByCuisine(cuisine);
    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function getRestaurantsByCuisine(cuisine) {
  let query = 'SELECT * from restaurants WHERE cuisine = ?';
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}

// /restaurants/filter?isVeg=true&hasOutdoorSeating=true&isLuxury=false
app.get('/restaurants/filter', async (req, res) => {
  try {
    let isVeg = req.query.isVeg;
    let outDoorSeating = req.query.hasOutdoorSeating;
    let Luxury = req.query.isLuxury;
    let result = await fetchRestaurantsByFilters(isVeg, outDoorSeating, Luxury);
    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// /restaurants/filter?isVeg=true&hasOutdoorSeating=false&isLuxury=false
async function fetchRestaurantsByFilters(isVeg, outDoorSeating, Luxury) {
  let query =
    'SELECT * from restaurants WHERE isVeg = ? and hasOutdoorSeating = ? and isLuxury = ?';
  let response = await db.all(query, [isVeg, outDoorSeating, Luxury]);
  return { restaurants: response };
}

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let result = await sortRestaurantsByRating();
    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function sortRestaurantsByRating() {
  let query = 'SELECT * from restaurants ORDER BY rating DESC';
  let response = await db.all(query, []);
  return { restaurants: response };
}

app.get('/dishes', async (req, res) => {
  try {
    let result = await fetchAllDishes();
    if (result.dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
async function fetchAllDishes() {
  let query = 'SELECT * from dishes';
  let response = await db.all(query, []);

  return { dishes: response };
}

app.get('/dishes/details/:id', async (req, res) => {
  let DishId = parseInt(req.params.id);
  console.log('dishId: ' + typeof DishId);
  try {
    let result = await getDishesById(DishId);
    if (result.dishes.length === 0) {
      return res
        .status(404)
        .json({ message: 'No dishes details found for ' + DishId + ' id' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function getDishesById(DishId) {
  let query = 'SELECT * from dishes WHERE id = ?';
  let response = await db.all(query, [DishId]);
  return { dishes: response };
}

// /dishes/filter?isVeg=true
app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  try {
    let result = await filterDishesByIsVeg(isVeg);
    if (result.dishes.length === 0) {
      return res
        .status(404)
        .json({ message: 'No Dishes found for filter isVeg ' + isVeg });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function filterDishesByIsVeg(isVeg) {
  let query = 'SELECT * from dishes WHERE isVeg = ?';
  let response = await db.all(query, [isVeg]);
  return { dishes: response };
}

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let result = await sortDishesByPriceInAscendingOrder();
    if (result.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes Found' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
async function sortDishesByPriceInAscendingOrder() {
  let query = 'SELECT * from dishes ORDER BY price ASC';
  let response = await db.all(query, []);
  return { dishes: response };
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
