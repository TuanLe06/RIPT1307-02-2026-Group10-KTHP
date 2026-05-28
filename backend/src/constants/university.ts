export const UNIVERSITY_ERRORS = {
  REQUIRED: 'Thông tin trường không được để trống',
  NOT_FOUND: 'Không tìm thấy trường đại học',
  CODE_EXISTS: 'Mã trường đã tồn tại',
  IN_USE: 'Không thể xóa vì có dữ liệu liên quan',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
} as const;

export const UNIVERSITY_MESSAGES = {
  CREATED: 'Thêm trường đại học thành công',
  UPDATED: 'Cập nhật trường đại học thành công',
  DELETED: 'Xóa trường đại học thành công',
  RETRIEVED: 'Lấy thông tin trường đại học thành công',
  LISTED: 'Lấy danh sách trường đại học thành công',
} as const;

export const MAJOR_ERRORS = {
  REQUIRED: 'Thông tin ngành học không được để trống',
  NOT_FOUND: 'Không tìm thấy ngành học',
  CODE_EXISTS: 'Mã ngành đã tồn tại trong trường này',
  UNIVERSITY_NOT_FOUND: 'Không tìm thấy trường đại học',
  IN_USE: 'Không thể xóa vì có dữ liệu liên quan',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  ADMISSION_NOT_FOUND: 'Tổ hợp xét tuyển không tồn tại',
} as const;

export const MAJOR_MESSAGES = {
  CREATED: 'Thêm ngành học thành công',
  UPDATED: 'Cập nhật ngành học thành công',
  DELETED: 'Xóa ngành học thành công',
  RETRIEVED: 'Lấy thông tin ngành học thành công',
  LISTED: 'Lấy danh sách ngành học thành công',
} as const;
