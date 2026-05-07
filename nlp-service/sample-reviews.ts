// Bộ dữ liệu mẫu gồm 5 đánh giá về Laptop Acer cho unit test
// Bao gồm cả đánh giá tốt, xấu và trung bình

export const sampleReviews = [
  {
    id: 1,
    product: "Laptop Acer Aspire 5",
    review: "Máy này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng. Màn hình sắc nét, bàn phím êm, pin trâu được 7-8 tiếng dùng văn phòng. Giá cả hợp lý so với cấu hình. Rất recommend cho sinh viên và dân văn phòng.",
    expected: {
      rating_score: 5,
      sentiment: "Positive",
      is_fake_review: false
    }
  },
  {
    id: 2,
    product: "Laptop Acer Nitro 5",
    review: "Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi màn hình. Dịch vụ chăm sóc khách hàng cũng tệ, gọi mãi không ai nghe. Pin yếu chỉ được 2 tiếng, máy nóng kinh khủng khi chơi game. Thất vọng vô cùng!",
    expected: {
      rating_score: 1,
      sentiment: "Negative",
      is_fake_review: false
    }
  },
  {
    id: 3,
    product: "Laptop Acer Swift 3",
    review: "Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi, cấu hình đủ dùng word, excel, lướt web. Tuy nhiên bàn phím hơi cứng và loa không được to lắm. Tạm ổn cho nhu cầu cơ bản.",
    expected: {
      rating_score: 3,
      sentiment: "Neutral",
      is_fake_review: false
    }
  },
  {
    id: 4,
    product: "Laptop Acer Predator Helios",
    review: "Tốt tốt tốt tốt tốt! Mua ngay đi! Sản phẩm tốt nhất! Rất tốt! Tốt quá!",
    expected: {
      rating_score: 5,
      sentiment: "Positive",
      is_fake_review: true
    }
  },
  {
    id: 5,
    product: "Laptop Acer Aspire 7",
    review: "Laptop Acer Aspire 7 là một lựa chọn tốt cho người dùng cần hiệu năng cao với giá phải chăng. CPU Intel Core i5 thế hệ 12 kết hợp với NVIDIA GTX 1650 cho phép chạy mượt các ứng dụng đồ họa nhẹ và game phổ thông. SSD 512GB đủ lưu trữ tài liệu và phần mềm. Tuy nhiên, thiết kế hơi dày và nặng so với các dòng ultrabook cùng phân khúc.",
    expected: {
      rating_score: 4,
      sentiment: "Positive",
      is_fake_review: false
    }
  }
];

// Export chỉ nội dung reviews để test
export const reviewTexts = sampleReviews.map(r => r.review);
