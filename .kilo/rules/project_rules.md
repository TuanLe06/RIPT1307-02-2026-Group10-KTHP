# Project Rules for Admissions System

## 1. Authentication Rules
- **Role-Based Access Control**: Clear separation between Candidate (Thí sinh) and Administrator (Quản trị viên) roles
- **Candidate Permissions**:
  - Access only to personal profile and application functions
  - Cannot access administrative panels or other candidates' data
- **Administrator Permissions**:
  - Full access to application management, user administration, and system configuration
  - Cannot modify candidate profiles in "Approved" state (see Processing Rules)

## 2. Profile Registration Flow Rules
- **Mandatory Sequence**: Registration must follow this exact order:
  1. Select aspiration (Chọn nguyện vọng)
  2. Declare personal information (Khai báo thông tin)
  3. Enter academic information (Nhập thông tin học tập)
  4. Upload evidence documents (Tải minh chứng)
  5. Final confirmation (Xác nhận)
- **Validation**: Each step must be completed before proceeding to the next
- **Navigation Prevention**: Direct URL access to skip steps is prohibited

## 3. Evidence Data Rules
- **Allowed Formats**: PDF, JPEG, PNG only
- **Validation**:
  - File extension check (.pdf, .jpg, .jpeg, .png)
  - MIME type verification
  - Content-based validation (magic bytes/check signatures)
- **Rejection**: Any other format must be rejected with clear error message

## 4. Profile Processing Rules
- **State Consistency**: Profile states must be exclusively one of:
  - `Chờ duyệt` (Pending)
  - `Đã duyệt` (Approved)
  - `Từ chối` (Rejected)
- **State Transition Rules**:
  - Pending → Approved/Rejected (via admin review)
  - Rejected → Pending (if candidate resubmits after fixes)
  - Approved → [No further edits allowed] (terminal state for editing)
- **Edit Restriction**:
  - Candidates can only edit profiles in `Chờ duyệt` (Pending) state
  - Profiles in `Đã duyệt` (Approved) state are read-only for candidates
  - Administrators can update state but cannot modify content of approved profiles
  - Notification Requirement: Every profile status change must trigger the automatic email sending system to candidates.

## 5. Security Rules
- **Personal Information Protection**:
  - Sensitive data (CCCD, academic records) encrypted at rest (AES-256)
  - Transmission protected via TLS 1.3
  - Access logging for all sensitive data views
  - Data minimization: only store necessary information
- **Password Recovery**:
  - Secure token-based reset (cryptographically random, 24-hour expiry)
  - Tokens single-use only
  - No sensitive data in recovery emails
  - Rate limiting on recovery attempts (5 attempts/hour/IP)
  - Require re-authentication after password reset for sensitive operations
  Not: không có quận huyện trong mục điền thông tin cá nhân