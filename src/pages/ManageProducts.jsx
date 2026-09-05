import { useEffect, useState } from "react";

import BackButton from "../components/BackButton";


// =========================================
// API URL
// =========================================
//
// Both localhost and Vercel use the same
// Render backend.
//

const API_URL =
  "https://dairyhub-backend.onrender.com/api/products";


function ManageProducts() {

  // =========================================
  // PRODUCTS
  // =========================================

  const [products, setProducts] =
    useState([]);


  // =========================================
  // FORM DATA
  // =========================================

  const [formData, setFormData] =
    useState({

      name: "",

      category: "Milk",

      price: "",

      size: "",

      stock: "",

      available: true,

      description: "",

      image: ""

    });


  // =========================================
  // FORM LOADING
  // =========================================

  const [loading, setLoading] =
    useState(false);


  // =========================================
  // PRODUCT LOADING
  // =========================================

  const [fetchingProducts, setFetchingProducts] =
    useState(true);


  // =========================================
  // EDITING PRODUCT
  // =========================================

  const [editingProduct, setEditingProduct] =
    useState(null);


  // =========================================
  // AVAILABILITY PROCESSING
  // =========================================

  const [processingAvailabilityId, setProcessingAvailabilityId] =
    useState(null);


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts =
    async () => {

      try {

        setFetchingProducts(true);


        const response =
          await fetch(
            API_URL
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch products."
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


        alert(
          error.message ||
          "Unable to load products."
        );


      } finally {

        setFetchingProducts(false);

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

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked
      } = e.target;


      // =======================================
      // PRICE / STOCK VALIDATION
      // =======================================

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


      // =======================================
      // AVAILABILITY CHECKBOX
      // =======================================

      if (
        type === "checkbox"
      ) {

        setFormData({

          ...formData,

          [name]:
            checked

        });


        return;

      }


      // =======================================
      // NORMAL INPUT
      // =======================================

      setFormData({

        ...formData,

        [name]:
          value

      });

    };


  // =========================================
  // RESET FORM
  // =========================================

  const resetForm =
    () => {

      setFormData({

        name: "",

        category: "Milk",

        price: "",

        size: "",

        stock: "",

        available: true,

        description: "",

        image: ""

      });


      setEditingProduct(
        null
      );

    };


  // =========================================
  // VALIDATE FORM
  // =========================================

  const validateForm =
    () => {

      // =====================================
      // NAME
      // =====================================

      if (
        !formData.name.trim()
      ) {

        alert(
          "Please enter a product name."
        );


        return false;

      }


      // =====================================
      // SIZE
      // =====================================

      if (
        !formData.size.trim()
      ) {

        alert(
          "Please enter the product size / quantity."
        );


        return false;

      }


      // =====================================
      // PRICE
      // =====================================

      const price =
        Number(
          formData.price
        );


      if (

        formData.price === "" ||

        Number.isNaN(
          price
        ) ||

        price < 0

      ) {

        alert(
          "Price must be 0 or greater."
        );


        return false;

      }


      // =====================================
      // STOCK
      // =====================================

      const stock =
        Number(
          formData.stock
        );


      if (

        formData.stock === "" ||

        Number.isNaN(
          stock
        ) ||

        stock < 0

      ) {

        alert(
          "Available Stock must be 0 or greater."
        );


        return false;

      }


      // =====================================
      // WHOLE NUMBER STOCK
      // =====================================

      if (
        !Number.isInteger(
          stock
        )
      ) {

        alert(
          "Available Stock must be a whole number."
        );


        return false;

      }


      // =====================================
      // IMAGE
      // =====================================

      const imageValue =
        formData.image.trim();


      if (
        imageValue
      ) {

        const isLocalPath =
          imageValue.startsWith(
            "/"
          );


        let isValidUrl =
          false;


        try {

          new URL(
            imageValue
          );


          isValidUrl =
            true;


        } catch {

          isValidUrl =
            false;

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


      setLoading(
        true
      );


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

        available:
          Boolean(
            formData.available
          ),

        description:
          formData.description.trim(),

        image:
          formData.image.trim()

      };


      try {

        let response;


        // ===================================
        // UPDATE
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
        // ADD
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
        // RESPONSE CHECK
        // ===================================

        if (
          !response.ok
        ) {

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
        // UPDATE LOCAL STATE
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

        setLoading(
          false
        );

      }

    };


  // =========================================
  // EDIT PRODUCT
  // =========================================

  const editProduct =
    (product) => {

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

        available:
          product.available !== false,

        description:
          product.description ||
          "",

        image:
          product.image ||
          ""

      });


      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

      });

    };


  // =========================================
  // CHANGE PRODUCT AVAILABILITY
  // =========================================

  const toggleAvailability =
    async (product) => {

      const currentAvailability =
        product.available !== false;


      const newAvailability =
        !currentAvailability;


      const actionText =
        newAvailability
          ? "make this product available"
          : "mark this product as out of stock";


      const confirmed =
        window.confirm(

          `Are you sure you want to ${actionText}?\n\n` +

          `${product.name}` +

          `${
            product.size
              ? ` (${product.size})`
              : ""
          }`

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingAvailabilityId(
          product.id
        );


        const response =
          await fetch(
            `${API_URL}/${product.id}/availability`,
            {

              method:
                "PUT",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  available:
                    newAvailability

                })

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          throw new Error(
            responseText ||
            "Unable to update product availability."
          );

        }


        const updatedProduct =
          JSON.parse(
            responseText
          );


        // ===================================
        // UPDATE PRODUCTS
        // ===================================

        setProducts(
          previousProducts =>
            previousProducts.map(
              item =>

                item.id ===
                updatedProduct.id

                  ? updatedProduct

                  : item

            )
        );


        // ===================================
        // UPDATE EDIT FORM
        // ===================================

        if (
          editingProduct?.id ===
          updatedProduct.id
        ) {

          setEditingProduct(
            updatedProduct
          );


          setFormData(
            previousForm => ({

              ...previousForm,

              available:
                updatedProduct.available !== false

            })
          );

        }


        alert(

          newAvailability

            ? `${product.name} is now available.`

            : `${product.name} is now out of stock.`

        );


      } catch (error) {

        console.error(
          "Availability update error:",
          error
        );


        alert(
          error.message ||
          "Unable to update product availability."
        );


      } finally {

        setProcessingAvailabilityId(
          null
        );

      }

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


        if (
          !response.ok
        ) {

          const errorMessage =
            await response.text();


          throw new Error(
            errorMessage ||
            "Failed to delete product."
          );

        }


        setProducts(
          previousProducts =>
            previousProducts.filter(
              product =>
                product.id !==
                id
            )
        );


        // ===================================
        // RESET EDIT FORM
        // ===================================

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


          {/* STOCK */}

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


          {/* SIZE */}

          <input
            type="text"
            name="size"
            placeholder="Product Size / Quantity (e.g. 1 L, 500 ml, 1 kg, 500 g)"
            value={
              formData.size
            }
            onChange={
              handleChange
            }
            required
          />


          {/* =================================
              AVAILABILITY
          ================================== */}

          <div
            className="product-availability-control"
          >

            <label>

              <input
                type="checkbox"
                name="available"
                checked={
                  formData.available
                }
                onChange={
                  handleChange
                }
              />


              <span>

                {formData.available

                  ? "Available for Purchase"

                  : "Out of Stock"

                }

              </span>

            </label>

          </div>


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
                disabled={
                  loading
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


        {fetchingProducts ? (

          <p>
            Loading products...
          </p>

        ) : products.length ===
          0 ? (

          <p>
            No products available.
          </p>

        ) : (

          <div
            className="product-grid"
          >

            {products.map(
              product => {

                const isAvailable =
                  product.available !== false;


                const isProcessingAvailability =
                  processingAvailabilityId ===
                  product.id;


                return (

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


                    {/* =================================
                        AVAILABILITY STATUS
                    ================================== */}

                    <p>

                      Status:{" "}

                      {isAvailable ? (

                        <span
                          className="product-available-status"
                        >
                          ✅ Available
                        </span>

                      ) : (

                        <span
                          className="product-unavailable-status"
                        >
                          🔴 Out of Stock
                        </span>

                      )}

                    </p>


                    {/* DESCRIPTION */}

                    <p>
                      {product.description}
                    </p>


                    {/* =================================
                        ACTIONS
                    ================================== */}

                    <div
                      className="product-actions"
                    >

                      {/* EDIT */}

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


                      {/* AVAILABILITY */}

                      <button
                        type="button"
                        className={

                          isAvailable

                            ? "product-unavailable-btn"

                            : "product-available-btn"

                        }
                        onClick={() =>
                          toggleAvailability(
                            product
                          )
                        }
                        disabled={
                          isProcessingAvailability
                        }
                      >

                        {isProcessingAvailability

                          ? "Updating..."

                          : isAvailable

                            ? "🔴 Mark Out of Stock"

                            : "✅ Mark Available"

                        }

                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          deleteProduct(
                            product.id
                          )
                        }
                        disabled={
                          isProcessingAvailability
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default ManageProducts;