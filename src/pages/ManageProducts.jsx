import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";


const API_URL =
  "https://dairyhub-backend.onrender.com/api/products";


function ManageProducts() {

  const [products, setProducts] = useState([]);


  const [formData, setFormData] = useState({

    name: "",
    category: "Milk",
    price: "",
    size: "",
    stock: "",
    description: "",
    image: ""

  });


  const [loading, setLoading] =
    useState(false);


  const [editingProduct, setEditingProduct] =
    useState(null);


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {

    try {

      const response =
        await fetch(API_URL);


      if (!response.ok) {

        throw new Error(
          "Failed to fetch products"
        );

      }


      const data =
        await response.json();


      setProducts(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Error fetching products:",
        error
      );

    }

  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    fetchProducts();

  }, []);


  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    /*
     * Price and stock cannot be negative.
     */

    if (
      name === "price" ||
      name === "stock"
    ) {

      if (
        value !== "" &&
        Number(value) < 0
      ) {

        return;

      }

    }


    setFormData({

      ...formData,

      [name]:
        value

    });

  };


  // =========================================
  // RESET FORM
  // =========================================

  const resetForm = () => {

    setFormData({

      name: "",
      category: "Milk",
      price: "",
      size: "",
      stock: "",
      description: "",
      image: ""

    });


    setEditingProduct(null);

  };


  // =========================================
  // VALIDATE FORM
  // =========================================

  const validateForm = () => {

    if (
      !formData.name.trim()
    ) {

      alert(
        "Please enter a product name."
      );

      return false;

    }


    if (
      !formData.size.trim()
    ) {

      alert(
        "Please enter the product size / quantity."
      );

      return false;

    }


    const price =
      Number(
        formData.price
      );


    if (
      formData.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {

      alert(
        "Price must be 0 or greater."
      );

      return false;

    }


    const stock =
      Number(
        formData.stock
      );


    if (
      formData.stock === "" ||
      Number.isNaN(stock) ||
      stock < 0
    ) {

      alert(
        "Available Stock must be 0 or greater."
      );

      return false;

    }


    if (
      !Number.isInteger(stock)
    ) {

      alert(
        "Available Stock must be a whole number."
      );

      return false;

    }


    /*
     * Image can be:
     *
     * /images/milk.jpg
     *
     * OR
     *
     * https://example.com/milk.jpg
     */

    const imageValue =
      formData.image.trim();


    if (imageValue) {

      const isLocalPath =
        imageValue.startsWith("/");


      let isValidUrl =
        false;


      try {

        new URL(
          imageValue
        );

        isValidUrl = true;

      } catch {

        isValidUrl = false;

      }


      if (
        !isLocalPath &&
        !isValidUrl
      ) {

        alert(
          "Please enter a valid image path or URL."
        );

        return false;

      }

    }


    return true;

  };


  // =========================================
  // ADD / UPDATE PRODUCT
  // =========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (
        !validateForm()
      ) {

        return;

      }


      setLoading(true);


      const productData = {

        name:
          formData.name.trim(),

        category:
          formData.category,

        price:
          Number(
            formData.price
          ),

        size:
          formData.size.trim(),

        stock:
          Number(
            formData.stock
          ),

        description:
          formData.description.trim(),

        image:
          formData.image.trim()

      };


      try {

        let response;


        // ===================================
        // UPDATE EXISTING PRODUCT
        // ===================================

        if (
          editingProduct
        ) {

          response =
            await fetch(
              `${API_URL}/${editingProduct.id}`,
              {

                method:
                  "PUT",

                headers: {

                  "Content-Type":
                    "application/json"

                },

                body:
                  JSON.stringify(
                    productData
                  )

              }
            );

        }


        // ===================================
        // ADD NEW PRODUCT
        // ===================================

        else {

          response =
            await fetch(
              API_URL,
              {

                method:
                  "POST",

                headers: {

                  "Content-Type":
                    "application/json"

                },

                body:
                  JSON.stringify(
                    productData
                  )

              }
            );

        }


        // ===================================
        // CHECK RESPONSE
        // ===================================

        if (!response.ok) {

          const errorMessage =
            await response.text();


          throw new Error(
            errorMessage ||
            "Unable to save product."
          );

        }


        const savedProduct =
          await response.json();


        // ===================================
        // UPDATE LOCAL UI
        // ===================================

        if (
          editingProduct
        ) {

          setProducts(
            previousProducts =>
              previousProducts.map(
                product =>
                  product.id ===
                  savedProduct.id
                    ? savedProduct
                    : product
              )
          );


          alert(
            "Product updated successfully!"
          );

        } else {

          setProducts(
            previousProducts => [
              ...previousProducts,
              savedProduct
            ]
          );


          alert(
            "Product added successfully!"
          );

        }


        resetForm();


      } catch (error) {

        console.error(
          "Save product error:",
          error
        );


        alert(
          error.message ||
          "Unable to save product."
        );


      } finally {

        setLoading(false);

      }

    };


  // =========================================
  // EDIT PRODUCT
  // =========================================

  const editProduct = (
    product
  ) => {

    setEditingProduct(
      product
    );


    setFormData({

      name:
        product.name ||
        "",

      category:
        product.category ||
        "Milk",

      price:
        product.price ??
        "",

      size:
        product.size ||
        "",

      stock:
        product.stock ??
        "",

      description:
        product.description ||
        "",

      image:
        product.image ||
        ""

    });


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  // =========================================
  // DELETE PRODUCT
  // =========================================

  const deleteProduct =
    async (
      id
    ) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to permanently delete this product?"
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      try {

        const response =
          await fetch(
            `${API_URL}/${id}`,
            {

              method:
                "DELETE"

            }
          );


        if (!response.ok) {

          const errorMessage =
            await response.text();


          throw new Error(
            errorMessage ||
            "Failed to delete product"
          );

        }


        setProducts(
          previousProducts =>
            previousProducts.filter(
              product =>
                product.id !== id
            )
        );


        /*
         * If the deleted product was currently
         * being edited, reset the form.
         */

        if (
          editingProduct?.id ===
          id
        ) {

          resetForm();

        }


        alert(
          "Product deleted successfully!"
        );


      } catch (error) {

        console.error(
          "Delete product error:",
          error
        );


        alert(
          error.message ||
          "Unable to delete product."
        );

      }

    };


  // =========================================
  // PAGE
  // =========================================

  return (

    <div
      className="admin-page"
    >

      <BackButton
        to="/admin"
        text="← Back to Admin Dashboard"
      />


      <h1>
        Manage Products
      </h1>


      {/* =====================================
          PRODUCT FORM
      ====================================== */}

      <div
        className="admin-form-container"
      >

        <h2>

          {editingProduct
            ? "Edit Product"
            : "Add New Product"
          }

        </h2>


        <form
          className="admin-form"
          onSubmit={
            handleSubmit
          }
        >


          {/* PRODUCT NAME */}

          <input
            name="name"
            type="text"
            placeholder="Product Name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            required
          />


          {/* CATEGORY */}

          <select
            name="category"
            value={
              formData.category
            }
            onChange={
              handleChange
            }
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


          {/* PRICE */}

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={
              formData.price
            }
            min="0"
            step="1"
            onChange={
              handleChange
            }
            required
          />


          {/* AVAILABLE STOCK */}

          <input
            type="number"
            name="stock"
            placeholder="Available Stock"
            value={
              formData.stock
            }
            min="0"
            step="1"
            onChange={
              handleChange
            }
            required
          />


          {/* PRODUCT SIZE */}

          <input
            type="text"
            name="size"
            placeholder="Product Size / Quantity (e.g. 1 L, 500 ml, 250 ml, 1 kg, 500 g)"
            value={
              formData.size
            }
            onChange={
              handleChange
            }
            required
          />


          {/* IMAGE */}

          <input
            name="image"
            type="text"
            placeholder="Image path or URL"
            value={
              formData.image
            }
            onChange={
              handleChange
            }
          />


          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Product Description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            required
          />


          {/* FORM BUTTONS */}

          <div
            className="product-form-buttons"
          >

            <button
              type="submit"
              disabled={
                loading
              }
            >

              {loading

                ? editingProduct
                  ? "Updating Product..."
                  : "Adding Product..."

                : editingProduct
                  ? "Update Product"
                  : "Add Product"

              }

            </button>


            {editingProduct && (

              <button
                type="button"
                className="cancel-edit-product"
                onClick={
                  resetForm
                }
              >
                Cancel Edit
              </button>

            )}

          </div>

        </form>

      </div>


      {/* =====================================
          ALL PRODUCTS
      ====================================== */}

      <div
        className="manage-products"
      >

        <h2>
          All Products
        </h2>


        {products.length === 0 ? (

          <p>
            No products available.
          </p>

        ) : (

          <div
            className="product-grid"
          >

            {products.map(
              product => (

                <div
                  className="product-card"
                  key={
                    product.id
                  }
                >


                  {/* IMAGE */}

                  {product.image && (

                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                    />

                  )}


                  {/* NAME */}

                  <h3>
                    {product.name}
                  </h3>


                  {/* CATEGORY */}

                  <p>
                    Category:{" "}
                    {product.category}
                  </p>


                  {/* SIZE */}

                  <p>
                    Size:{" "}
                    {product.size ||
                      "Not specified"}
                  </p>


                  {/* PRICE */}

                  <p>
                    Price: ₹
                    {product.price}
                  </p>


                  {/* STOCK */}

                  <p>
                    Stock:{" "}
                    {product.stock}
                  </p>


                  {/* DESCRIPTION */}

                  <p>
                    {product.description}
                  </p>


                  {/* ACTION BUTTONS */}

                  <div
                    className="product-actions"
                  >

                    <button
                      type="button"
                      className="edit-product-btn"
                      onClick={() =>
                        editProduct(
                          product
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        deleteProduct(
                          product.id
                        )
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default ManageProducts;