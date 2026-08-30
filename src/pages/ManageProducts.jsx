import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function ManageProducts() {

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "Milk",
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);


  const fetchProducts = async () => {

    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/products"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data);

    } catch (error) {

      console.error(
        "Error fetching products:",
        error
      );

    }

  };


  useEffect(() => {

    fetchProducts();

  }, []);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    const newProduct = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      image: formData.image,
    };


    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/products",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(newProduct),
        }
      );


      if (!response.ok) {
        throw new Error(
          "Failed to add product"
        );
      }


      const savedProduct =
        await response.json();


      setProducts((previousProducts) => [
        ...previousProducts,
        savedProduct,
      ]);


      setFormData({
        name: "",
        category: "Milk",
        price: "",
        stock: "",
        description: "",
        image: "",
      });


      alert(
        "Product added successfully!"
      );


    } catch (error) {

      console.error(
        "Add product error:",
        error
      );

      alert(
        "Unable to add product."
      );

    } finally {

      setLoading(false);

    }

  };


  const deleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      const response = await fetch(
        `https://dairyhub-backend.onrender.com/api/products/${id}`,
        {
          method: "DELETE",
        }
      );


      if (!response.ok) {
        throw new Error(
          "Failed to delete product"
        );
      }


      setProducts(
        (previousProducts) =>
          previousProducts.filter(
            (product) =>
              product.id !== id
          )
      );


      alert(
        "Product deleted successfully!"
      );


    } catch (error) {

      console.error(
        "Delete product error:",
        error
      );

      alert(
        "Unable to delete product."
      );

    }

  };


  return (

    <div className="admin-page">

      <BackButton
        to="/admin"
        text="← Back to Admin Dashboard"
      />

      <h1>
        Manage Products
      </h1>


      <div className="admin-form-container">

        <h2>
          Add New Product
        </h2>


        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          <input
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />


          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >

            <option value="Milk">
              Milk
            </option>

            <option value="Curd">
              Curd
            </option>

            <option value="Paneer">
              Paneer
            </option>

            <option value="Butter">
              Butter
            </option>

            <option value="Ghee">
              Ghee
            </option>

          </select>


          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />


          <input
            type="number"
            name="stock"
            placeholder="Available Stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />


          <input
            name="image"
            placeholder="Product Image URL"
            value={formData.image}
            onChange={handleChange}
          />


          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Adding Product..."
              : "Add Product"}

          </button>

        </form>

      </div>


      <div className="manage-products">

        <h2>
          All Products
        </h2>


        <div className="product-grid">

          {products.map(
            (product) => (

              <div
                className="product-card"
                key={product.id}
              >

                {product.image && (

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                )}


                <h3>
                  {product.name}
                </h3>


                <p>
                  Category: {product.category}
                </p>


                <p>
                  Price: ₹{product.price}
                </p>


                <p>
                  Stock: {product.stock}
                </p>


                <p>
                  {product.description}
                </p>


                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteProduct(product.id)
                  }
                >
                  Delete
                </button>

              </div>

            )
          )}

        </div>

      </div>

    </div>

  );

}

export default ManageProducts;