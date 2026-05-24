## 1. Admin API Surface

- [x] 1.1 Thêm route `PUT /api/admin/candidates/:citizenId/exam-scores-by-group` trong nhóm admin và gắn `authenticate + authorize('ADMIN')`
- [x] 1.2 Thêm validation cho `citizenId`, `science_group`, và cấu trúc `scores` theo tổ hợp môn của từng khối
- [x] 1.3 Thêm controller handler `upsertCandidateExamScoresByGroupAsAdmin` trả lỗi chuẩn `400/401/403/404`

## 2. Business Logic and Data Update

- [x] 2.1 Bổ sung model method tìm thí sinh theo `citizen_id` và ensure `academic_record` tồn tại
- [x] 2.2 Bổ sung logic map `scores` theo khối thành danh sách `exam_scores` chuẩn (`subject_code`, `subject_name`, `score`)
- [x] 2.3 Upsert điểm vào `exam_scores` theo unique `(record_id, subject_code)` và cập nhật `academic_records.science_group`

## 3. Documentation and Verification

- [x] 3.1 Cập nhật swagger cho endpoint admin mới (request/response và các mã lỗi)
- [x] 3.2 Bổ sung tests cho NATURAL success, SOCIAL success, invalid group/subject set/score range, candidate not found, unauthorized
- [x] 3.3 Chạy `npm run test:candidate-profile` và `npm run build`
