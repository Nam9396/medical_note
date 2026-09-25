# Hướng dẫn quản lý ảnh

## Kho ảnh chung: `docs/assets/images/`

| Thư mục | Nội dung |
|---|---|
| `_inbox/` | Ảnh mới dán vào, chưa phân loại (dọn cuối buổi) |
| `giai-phau/` | Giải phẫu, sinh lý |
| `vi-sinh/` | Nhuộm Gram, khuẩn lạc, kính hiển vi |
| `hinh-anh-hoc/` | CT, MRI, X-quang, siêu âm |
| `lam-sang/` | Ảnh bệnh nhân, dấu hiệu lâm sàng |
| `so-do/` | Lưu đồ, sơ đồ cơ chế, thuật toán |

Có thể thêm thư mục mới khi cần (chữ thường, không dấu, gạch ngang).

## Đặt tên file

`chu-de_mo-ta_nguon-nam.duoi` — chữ thường, không dấu, gạch ngang giữa các từ, gạch dưới giữa các phần.

- `vmn_ct-ap-xe-nao_kaplan-2025.webp`
- `vmn_luu-do-chi-dinh-ct_who-2026.svg`

**Ảnh đã dùng thì không đổi tên bằng tay ngoài VS Code** (sẽ hỏng link). Đổi tên / di chuyển trong VS Code → chọn *Yes* khi được hỏi cập nhật link.

## Quy trình

1. Đang soạn: chụp màn hình (Cmd + Shift + 4, ảnh vào bộ nhớ tạm) → Cmd + V vào bài. Ảnh tự lưu vào `_inbox/`.
2. Cuối buổi: kéo ảnh từ `_inbox/` sang thư mục chủ đề, đổi tên theo quy tắc, chọn *Yes* để cập nhật link.
3. Dùng lại ở bài khác: gõ `![](../assets/images/` → chọn từ gợi ý. Không chép thêm bản mới.

## Chèn hình có chú thích

Gõ tên mẫu (bàn phím **ABC**, không bật bộ gõ tiếng Việt) rồi **Tab**; hoặc Cmd+Shift+P → *Insert Snippet*.

| Mẫu | Dùng khi |
|---|---|
| `hinh` | Hình lấy từ sách/bài báo (chọn "Phỏng theo" hoặc "Trích từ") |
| `hinh-tu` | Sơ đồ/ảnh tự làm |
| `hinh-ab` | 2 ảnh cạnh nhau (A, B) |
| `hinh-bn` | Ảnh bệnh nhân |

Cấu trúc chú thích (dưới hình):

```
Hình x. Tên hình.
Ghi chú. Mũi tên: …; CT: chụp cắt lớp vi tính; nhuộm Gram ×1000.
Trích từ *Tên Sách Viết Hoa Chữ Đầu* (4th ed., tr. 524, Hình 19.84), bởi E. C. Klatt, 2021, Elsevier. Bản quyền năm 2021 thuộc Elsevier.
```

`<figcaption markdown="span">` bắt buộc có `markdown="span"` — thiếu thì chữ **đậm** hiện nguyên dấu `**`.

## Kích thước ảnh

Không cần ghi gì → ảnh tự ở cỡ **vừa** (~360px, không cao quá 40% màn hình). Muốn khác thì thêm sau link ảnh:

| Ghi | Cỡ | Dùng cho |
|---|---|---|
| `{ .img-sm }` | nhỏ ~240px | ảnh dọc, ảnh vi thể, dấu hiệu nhỏ |
| `{ .img-md }` | vừa ~360px | mặc định |
| `{ .img-lg }` | lớn ~560px | CT/MRI cần xem chi tiết |
| `{ .img-full }` | hết chiều ngang | lưu đồ, sơ đồ nhiều chữ |

## Ghi nguồn hình (APA 7, ghi công bản quyền)

Hình chép / phỏng theo **sách có bản quyền** → ghi **đầy đủ** ngay dưới hình (và vẫn liệt kê sách trong Tài liệu tham khảo):

```
Trích từ *Tên Sách* (4th ed., tr. 524, Hình 19.84), bởi E. C. Klatt, 2021, Elsevier. Bản quyền năm 2021 thuộc Elsevier.
```

- "Trích từ" = giữ nguyên · "Phỏng theo" = có cắt, thêm mũi tên, dịch, vẽ lại
- Tên sách in nghiêng, viết hoa chữ đầu mỗi từ chính; tác giả = chữ cái đầu + họ; nhiều biên tập viên thêm "(Eds.)"
- Có số trang thì ghi (tr. xx); số hình giúp tìm nhanh
- Đã xin phép nhà xuất bản → thêm "Tái sử dụng có sự cho phép."
- Ảnh Creative Commons / sơ đồ tự làm → dạng rút gọn là đủ: "Trích từ Amidu et al. (2019), giấy phép CC BY 4.0."

## Checklist trước khi chèn ảnh

**Bản quyền** (Luật SHTT, Điều 25: minh hoạ bài giảng / trích dẫn hợp lý được phép, **bắt buộc ghi tác giả và nguồn**)

- [ ] Ưu tiên: ảnh tự làm → ảnh Creative Commons → vẽ lại/phỏng theo → chép nguyên từ sách thương mại (hạn chế khi đăng công khai)
- [ ] Ghi "Trích từ" (giữ nguyên) hoặc "Phỏng theo" (có cắt, thêm mũi tên, dịch, vẽ lại)
- [ ] Ghi bản quyền (© năm, nhà xuất bản) hoặc giấy phép (CC BY / CC BY-NC …)
- [ ] Ảnh CC BY-ND: **không** được sửa (kể cả thêm mũi tên)

**Ảnh bệnh nhân**

- [ ] Có đồng ý bằng văn bản (trẻ em: cha mẹ / người giám hộ)
- [ ] Không nhận diện được: che mắt bằng vạch đen **không đủ**
- [ ] Phim CT/MRI/X-quang: đã xoá tên, ngày sinh, mã hồ sơ, tên bệnh viện, ngày chụp

**Trình bày**

- [ ] Số hình liên tục theo thứ tự xuất hiện
- [ ] Mô tả thay thế trong `![…]` là một câu mô tả nội dung ảnh
- [ ] Ghi chú giải thích mũi tên, dấu sao, chữ viết tắt
- [ ] CT/MRI: loại chuỗi xung, có/không cản quang, mặt cắt · Vi thể: phương pháp nhuộm, độ phóng đại
- [ ] Hình nhiều phần: đánh A, B, C và mô tả từng phần

## Định dạng

| Loại | Định dạng | Ghi chú |
|---|---|---|
| Sơ đồ tự vẽ | SVG | |
| Ảnh chụp (CT, lâm sàng, vi sinh) | WebP / JPG | Rộng ≤ 1600px, < 300 KB |
| Chụp màn hình có chữ | PNG / WebP | |
