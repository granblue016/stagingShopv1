package com.shopcart.backend.service;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // 1. Lấy toàn bộ danh sách sản phẩm (Dùng cho trang Home/Shop)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. Lấy chi tiết một sản phẩm (Dùng cho trang Product Detail)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * 3. Cập nhật thông tin sản phẩm (Sửa lỗi "cannot find symbol" tại dòng 61 của ProductController)
     */
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + id));

        // Cập nhật các thông tin cơ bản
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setCategory(updatedProduct.getCategory());

        // Lưu ý: Tên trường trong Model của bạn là stockQuantity (dựa trên các file trước đó)
        existingProduct.setStockQuantity(updatedProduct.getStockQuantity());

        return productRepository.save(existingProduct);
    }

    /**
     * 4. Cập nhật số lượng tồn kho (Sửa lỗi "cannot find symbol" tại dòng 71 của ProductController)
     */
    @Transactional
    public Product updateStock(Long id, Integer newStock) {
        // Sử dụng findById hoặc findByIdForUpdate tùy thuộc vào ProductRepository của bạn
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + id));

        // Đảm bảo dùng đúng tên setter setStockQuantity thay vì setStock
        product.setStockQuantity(newStock);
        return productRepository.save(product);
    }

    /**
     * 5. Thêm sản phẩm mới
     */
    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    /**
     * 6. Xóa sản phẩm
     */
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm để xóa!");
        }
        productRepository.deleteById(id);
    }
}