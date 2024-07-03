import express from "express";
import product from "../models/product/product.js";

const router = express.Router();

router.post("/add-product", async (req, res) => {
  const { title, price, description } = req.body;

  if (!title?.trim() || !price?.trim() || !description?.trim()) {
    return res.send({ message: "please fill all the filed", success: false });
  }

  const newProduct = new product({
    title,
    price,
    description,
    userId: req.id,
  });

  const productRes = await newProduct.save();

  res.send({
    message: "product is added ",
    product: productRes,
    success: true,
  });
});

router.post("/edit-product", async (req, res) => {
  try {
    const { title, price, description, productId } = req.body;

    if (
      !title?.trim() ||
      !price?.trim() ||
      !description?.trim() ||
      !productId?.trim()
    ) {
      return res.send({ message: "please fill all the filed", success: false });
    }

    const updatedProduct = await product.findByIdAndUpdate(
      { _id: productId },
      {
        title,
        price,
        description,
      },
      {
        new: true,
      }
    );

    return res.send({
      message: "product is updated ",
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    res.send({ message: "server side error", success: false });
  }
});

router.post("/delete-product/:id", async (req, res) => {
  try {
    const productId = req?.params?.id;

    if (!productId?.trim()) {
      return res.send({
        message: "Please provide the product id",
        success: false,
      });
    }

    const deletedProduct = await product.findByIdAndUpdate(
      { _id: productId },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    return res.send({
      message: "product is deleted ",
      product: deletedProduct,
      success: true,
    });
  } catch (error) {
    res.send({ message: "server side error", success: false });
  }
});

router.get("/get-products", async (req, res) => {
  try {
    const products = await product.find({ userId: req?.id, isDeleted: false });
    return res.send({
      message: "Here is the product lists",
      product: products,
      success: true,
    });
  } catch (error) {
    res.send({ message: "server side error", success: false });
  }
});

export default router;
