## Context

Hệ thống đã có API cho thí sinh tự cập nhật học bạ và đã chuẩn hóa lưu điểm theo bảng `exam_scores`, nhưng chưa có API cho admin nhập/cập nhật điểm theo khối xét tuyển. Nghiệp vụ tuyển sinh cần một endpoint admin nhất quán để cập nhật theo tổ hợp môn cố định của `KHTN/KHXH`, đồng thời bảo toàn quy tắc dữ liệu và quyền truy cập.

## Goals / Non-Goals

**Goals:**
- Cung cấp endpoint admin để cập nhật điểm thi theo khối cho thí sinh theo `citizen_id`.
- Ép dữ liệu đầu vào theo đúng tổ hợp môn của từng khối (`NATURAL`/`SOCIAL`).
- Upsert an toàn vào `exam_scores` (theo unique `record_id + subject_code`) và cập nhật `academic_records.science_group`.
- Trả lỗi rõ ràng cho các trường hợp sai dữ liệu, thiếu quyền, hoặc không tìm thấy thí sinh.

**Non-Goals:**
- Không thay thế endpoint candidate hiện có (`/api/candidate/profile/academic-record`).
- Không mở rộng sang các tổ hợp môn khác ngoài 2 khối đã chốt.
- Không thay đổi schema DB trong change này.

## Decisions

1. Tạo endpoint riêng cho admin `PUT /api/admin/candidates/:citizenId/exam-scores-by-group`.
- Rationale: tách biệt rõ responsibility giữa candidate self-service và admin operations.
- Alternative considered: tái sử dụng endpoint candidate cũ với role ADMIN; khó kiểm soát contract theo khối và dễ gây side effects.

2. Dùng `citizen_id` để định danh thí sinh trong API admin.
- Rationale: nghiệp vụ tuyển sinh đang vận hành theo định danh CCCD, phù hợp yêu cầu đã chốt.
- Alternative considered: `user_id` hoặc `record_id`; giảm tính trực quan nghiệp vụ.

3. Payload dùng `science_group` + `scores` object cố định 3 môn theo khối.
- Rationale: contract chặt, dễ validate và ngăn nhập sai tổ hợp.
- Alternative considered: gửi mảng môn linh hoạt; đơn giản backend nhưng tăng rủi ro dữ liệu không nhất quán giữa các thí sinh.

4. Tái sử dụng logic upsert `exam_scores` hiện có, chỉ thêm nhánh admin-targeted theo `citizen_id`.
- Rationale: tránh duplicate logic map `subject_code -> subject_name` và giữ một đường chuẩn ghi điểm.
- Alternative considered: viết luồng upsert độc lập cho admin; nhanh ban đầu nhưng tăng chi phí bảo trì.

## Risks / Trade-offs

- [Payload sai cấu trúc theo khối] -> Mitigation: validator bắt buộc đủ/đúng bộ môn theo từng `science_group`.
- [Admin nhập sai điểm ngoài range] -> Mitigation: validate cứng từng môn trong khoảng `0..10`.
- [Không tìm thấy candidate theo `citizen_id`] -> Mitigation: trả `404` nhất quán trước khi tạo/cập nhật record.
- [Đụng logic cũ candidate academic record] -> Mitigation: không sửa contract candidate endpoint, chỉ thêm endpoint admin và tái sử dụng model layer có kiểm soát.

## Migration Plan

1. Bổ sung route/admin validator/controller cho endpoint mới.
2. Bổ sung model methods theo `citizen_id` để ensure academic record và upsert điểm theo khối.
3. Cập nhật swagger cho endpoint admin.
4. Bổ sung tests cho happy path và các nhánh lỗi chính.
5. Chạy verification (`npm run test:candidate-profile`, `npm run build`).
6. Rollback nếu cần: remove endpoint admin và các method hỗ trợ, không cần rollback DB schema.

## Open Questions

- None.
