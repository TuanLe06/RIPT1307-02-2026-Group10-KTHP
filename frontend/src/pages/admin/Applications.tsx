import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { message, Modal, Select, Table } from "antd";
import { reportsApi } from "../../api/reports";
import SearchBar from "../../components/common/SearchBar";
import { applicationApi } from "../../api/applications";
import { universityApi } from "../../api/universities";
import { majorApi } from "../../api/majors";
import type {
  ApplicationWithDetails, ApplicationStatus, StatusLog,
  University, Major,
} from "../../types/university";

const STATUS_DISPLAY: Record<string, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Đã nộp",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PASSED: "Đã trúng tuyển",
  FAILED: "Không đỗ",
};

const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string; border: string }> = {
  PASSED: { bg: "bg-success/10", dot: "bg-success", text: "text-success", border: "border-success/20" },
  PENDING_REVIEW: { bg: "bg-warning/10", dot: "bg-warning", text: "text-on-tertiary-fixed-variant", border: "border-warning/20" },
  REJECTED: { bg: "bg-error-container", dot: "bg-error", text: "text-error", border: "border-error/20" },
  APPROVED: { bg: "bg-success/10", dot: "bg-success", text: "text-success", border: "border-success/20" },
  SUBMITTED: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  FAILED: { bg: "bg-error-container", dot: "bg-error", text: "text-error", border: "border-error/20" },
  DRAFT: { bg: "bg-surface-container-high", dot: "bg-outline", text: "text-on-surface-variant", border: "border-outline-variant" },
};

const Applications = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [uniFilter, setUniFilter] = useState<string>("");
  const [majorFilter, setMajorFilter] = useState<string>("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  // Stats
  const [totalApps, setTotalApps] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // Detail drawer state (modal-based)
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const allSelected = useMemo(
    () => applications.length > 0 && selectedIds.size === applications.length,
    [applications, selectedIds],
  );

  // Status update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("PENDING_REVIEW");
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);

  // Batch update modal
  const [batchUpdateOpen, setBatchUpdateOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<ApplicationStatus>("APPROVED");
  const [batchRejectReason, setBatchRejectReason] = useState("");
  const [batchUpdating, setBatchUpdating] = useState(false);

  // Load universities
  useEffect(() => {
    universityApi.getAll(1, 100).then((res) => setUniversities(res.data)).catch(() => {});
  }, []);

  // Load majors when uni changes
  useEffect(() => {
    if (!uniFilter) return;
    const uni = universities.find((u) => String(u.id) === uniFilter);
    if (!uni) return;
    majorApi.getByUniversity(uni.code, 1, 200)
      .then((res) => setMajors(res.data))
      .catch(() => setMajors([]));
  }, [uniFilter, universities]);

  // Load stats
  useEffect(() => {
    reportsApi.getByStatus().then((res) => {
      if (res.success) {
        const data = res.data;
        let total = 0;
        for (const s of data) {
          total += s.count;
          if (s.status === "PENDING_REVIEW") setPendingCount(s.count);
          if (s.status === "PASSED") setPassedCount(s.count);
          if (s.status === "REJECTED") setRejectedCount(s.count);
        }
        setTotalApps(total);
      }
    }).catch(() => {});
  }, []);

  const filterRef = useRef<HTMLDivElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await applicationApi.getAll({
          page,
          limit: pageSize,
          status: (statusFilter as ApplicationStatus) || undefined,
          university_id: uniFilter || undefined,
          major_id: majorFilter || undefined,
          search: search || undefined,
        });
        setApplications(res.data);
        setTotal(res.pagination.total);
      } catch {
        message.error("Không thể tải danh sách hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize, statusFilter, uniFilter, majorFilter, search, reloadKey]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openBatchUpdate = (status: ApplicationStatus) => {
    setBatchStatus(status);
    setBatchRejectReason("");
    setBatchUpdateOpen(true);
  };

  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) return;
    if ((batchStatus === "REJECTED" || batchStatus === "FAILED") && !batchRejectReason.trim()) {
      message.warning("Vui lòng nhập lý do");
      return;
    }
    setBatchUpdating(true);
    try {
      let success = 0;
      for (const id of selectedIds) {
        try {
          await applicationApi.updateStatus(id, {
            status: batchStatus,
            reject_reason:
              batchStatus === "REJECTED" || batchStatus === "FAILED"
                ? batchRejectReason.trim()
                : undefined,
          });
          success++;
        } catch { /* skip individual failure */ }
      }
      message.success(`Đã xử lý ${success}/${selectedIds.size} hồ sơ`);
      setBatchUpdateOpen(false);
      setSelectedIds(new Set());
      reload();
    } catch {
      message.error("Xử lý hàng loạt thất bại");
    } finally {
      setBatchUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Mã hồ sơ", "Thí sinh", "Email", "Trường", "Ngành",
      "Tổ hợp", "Ngày nộp", "Trạng thái", "Người duyệt", "Ngày duyệt",
    ];
    const rows = applications.map((a) => [
      a.application_code,
      a.candidate_name,
      a.candidate_email,
      a.university_name,
      a.major_name,
      a.combination_id ?? "",
      a.submitted_at
        ? new Date(a.submitted_at).toLocaleDateString("vi-VN")
        : "",
      STATUS_DISPLAY[a.status as ApplicationStatus] || a.status,
      a.reviewer_name ?? "",
      a.reviewed_at
        ? new Date(a.reviewed_at).toLocaleDateString("vi-VN")
        : "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh_sach_ho_so_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDetail = async (app: ApplicationWithDetails) => {
    setDetailOpen(true);
    setSelectedApp(app);
    setDetailLoading(true);
    try {
      const res = await applicationApi.getById(app.id);
      setStatusLogs(res.data.status_logs || []);
      setSelectedApp(res.data);
    } catch {
      message.error("Không thể tải chi tiết hồ sơ");
    } finally {
      setDetailLoading(false);
    }
  };

  const openUpdate = (app: ApplicationWithDetails, defaultStatus?: ApplicationStatus) => {
    setSelectedApp(app);
    setNewStatus(defaultStatus || "PENDING_REVIEW");
    setRejectReason("");
    setUpdateOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    if ((newStatus === "REJECTED" || newStatus === "FAILED") && !rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do");
      return;
    }
    setUpdating(true);
    try {
      const res = await applicationApi.updateStatus(selectedApp.id, {
        status: newStatus,
        reject_reason: (newStatus === "REJECTED" || newStatus === "FAILED") ? rejectReason.trim() : undefined,
      });
      if (res.success) {
        message.success("Cập nhật trạng thái thành công");
        setUpdateOpen(false);
        setDetailOpen(false);
        reload();
      }
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES.DRAFT;

  const tableColumns = [
    {
      title: "Mã HS",
      dataIndex: "application_code",
      key: "code",
      render: (v: string) => <span className="font-bold text-primary">{v}</span>,
    },
    {
      title: "Thí sinh",
      key: "candidate",
      render: (_: unknown, record: ApplicationWithDetails) => (
        <div>
          <p className="text-sm font-semibold text-on-surface">{record.candidate_name || "--"}</p>
          {record.candidate_id && <p className="text-xs text-text-secondary">ID: {record.candidate_id}</p>}
        </div>
      ),
    },
    {
      title: "Trường ứng tuyển",
      dataIndex: "university_name",
      key: "university",
      render: (v: string) => <span className="text-sm text-on-surface">{v}</span>,
    },
    {
      title: "Ngành học",
      dataIndex: "major_name",
      key: "major",
      render: (v: string) => <span className="text-sm text-on-surface">{v}</span>,
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitted_at",
      key: "date",
      render: (v: string | null) => (
        <span className="text-xs text-text-secondary">
          {v ? new Date(v).toLocaleDateString("vi-VN") : "--"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const st = getStatusStyle(v);
        return (
          <span className={`inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-xs font-bold ${st.bg} ${st.text} ${st.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {STATUS_DISPLAY[v] || v}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: ApplicationWithDetails) => (
        <div className="flex items-center justify-end gap-sm" onClick={(e) => e.stopPropagation()}>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-all"
            title="Xem chi tiết"
            onClick={() => openDetail(record)}
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          {(record.status === "SUBMITTED" || record.status === "PENDING_REVIEW") && (
            <>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-success/10 hover:text-success transition-all"
                title="Duyệt"
                onClick={() => openUpdate(record, "APPROVED")}
              >
                <span className="material-symbols-outlined text-[20px]">check</span>
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-error-container hover:text-error transition-all"
                title="Từ chối"
                onClick={() => openUpdate(record, "REJECTED")}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-lg w-full max-w-full">
      {/* Page Title */}
      <div>
        <h2 className="text-[28px] font-extrabold text-text-primary">Quản lý Hồ sơ nộp</h2>
        <p className="text-text-secondary mt-1">Theo dõi và phê duyệt hồ sơ ứng tuyển từ các thí sinh.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest border border-hairline-soft p-md rounded-xxl group">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tổng hồ sơ</span>
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-text-primary">{totalApps.toLocaleString()}</p>
          <p className="text-xs text-success flex items-center gap-xs mt-xs">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            Hồ sơ đã nộp
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-hairline-soft p-md rounded-xxl">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Chờ duyệt</span>
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-text-primary">{pendingCount.toLocaleString()}</p>
          <p className="text-xs text-tertiary flex items-center gap-xs mt-xs">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Cần xử lý ngay
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-hairline-soft p-md rounded-xxl">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Đã trúng tuyển</span>
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-text-primary">{passedCount.toLocaleString()}</p>
          <p className="text-xs text-success flex items-center gap-xs mt-xs">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Tỉ lệ {totalApps > 0 ? ((passedCount / totalApps) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-hairline-soft p-md rounded-xxl">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Từ chối</span>
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined">cancel</span>
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-text-primary">{rejectedCount.toLocaleString()}</p>
          <p className="text-xs text-outline flex items-center gap-xs mt-xs">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Đã thông báo thí sinh
          </p>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div ref={filterRef} className="bg-surface-container-lowest border border-hairline-soft p-md rounded-xxl space-y-md">
        <div className="flex flex-wrap items-end gap-md">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-text-primary mb-1">Tìm theo họ tên / mã HS</label>
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={() => setPage(1)}
              placeholder="Nhập họ tên hoặc mã hồ sơ..."
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-text-primary mb-1">Trường</label>
            <select
              className="w-full border-hairline rounded-lg px-md py-sm focus:ring-primary-soft focus:border-primary"
              value={uniFilter}
               onChange={(e) => { setUniFilter(e.target.value); setMajorFilter(""); if (!e.target.value) setMajors([]); setPage(1); }}
            >
              <option value="">Tất cả các trường</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-text-primary mb-1">Ngành</label>
            <select
              className="w-full border-hairline rounded-lg px-md py-sm focus:ring-primary-soft focus:border-primary"
              value={majorFilter}
              onChange={(e) => { setMajorFilter(e.target.value); setPage(1); }}
              disabled={!uniFilter}
            >
              <option value="">Tất cả các ngành</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-text-primary mb-1">Trạng thái</label>
            <select
              className="w-full border-hairline rounded-lg px-md py-sm focus:ring-primary-soft focus:border-primary"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_DISPLAY).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-sm pb-[2px]">
            <button
              onClick={exportCSV}
              className="bg-surface-container-low text-on-surface-variant px-lg py-[9px] rounded-full font-label hover:bg-surface-container-high transition-colors flex items-center gap-sm border border-hairline"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-fixed border border-primary/20 rounded-xl px-lg py-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-primary">checklist</span>
            <p className="text-sm font-bold text-on-primary-fixed-variant">
              Đã chọn <span className="text-primary">{selectedIds.size}</span> hồ sơ
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              className="bg-success text-on-primary px-lg py-sm rounded-full text-sm font-bold hover:brightness-110 transition-all flex items-center gap-sm"
              onClick={() => openBatchUpdate("APPROVED")}
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Duyệt tất cả
            </button>
            <button
              className="bg-critical text-on-critical px-lg py-sm rounded-full text-sm font-bold hover:brightness-110 transition-all flex items-center gap-sm"
              onClick={() => openBatchUpdate("REJECTED")}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Từ chối tất cả
            </button>
            <button
              className="bg-surface-container-low text-on-surface-variant px-lg py-sm rounded-full text-sm font-bold hover:bg-surface-container-high transition-all flex items-center gap-sm border border-hairline"
              onClick={() => setSelectedIds(new Set())}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Application Data Table */}
      <div className="bg-surface-container-lowest border border-hairline-soft rounded-xxl overflow-hidden">
        <Table
          columns={tableColumns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys: Array.from(selectedIds),
            onSelect: (record) => toggleSelect(record.id),
            onSelectAll: () => toggleSelectAll(),
          }}
          pagination={{
            current: page,
            total,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '15', '25'],
            onChange: (p: number, size: number) => {
              if (size !== pageSize) {
                setPageSize(size);
                setPage(1);
              } else {
                setPage(p);
              }
            },
          }}
          className="[&_.ant-table-thead_.ant-table-cell]:!bg-surface-container-low [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!font-bold [&_.ant-table-thead_.ant-table-cell]:!text-text-secondary [&_.ant-table-thead_.ant-table-cell]:!uppercase [&_.ant-table-tbody_.ant-table-row]:!cursor-pointer"
          onRow={(record) => ({
            onClick: () => openDetail(record),
          })}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={<span className="font-bold text-text-primary">Chi tiết hồ sơ: {selectedApp?.application_code}</span>}
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedApp(null); setStatusLogs([]); }}
        footer={null}
        width={640}
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12 text-text-secondary">
            <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
            Đang tải...
          </div>
        ) : selectedApp ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Mã hồ sơ</p>
                <p className="text-sm font-bold text-primary mt-0.5">{selectedApp.application_code}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Trạng thái</p>
                <span className={`inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-xs font-bold mt-0.5 ${getStatusStyle(selectedApp.status).bg} ${getStatusStyle(selectedApp.status).text} border ${getStatusStyle(selectedApp.status).border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(selectedApp.status).dot}`} />
                  {STATUS_DISPLAY[selectedApp.status] || selectedApp.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Thí sinh</p>
                <p className="text-sm text-on-surface mt-0.5">{selectedApp.candidate_name || "--"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Email</p>
                <p className="text-sm text-on-surface mt-0.5">{selectedApp.candidate_email || "--"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Trường</p>
                <p className="text-sm text-on-surface mt-0.5">{selectedApp.university_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Ngành</p>
                <p className="text-sm text-on-surface mt-0.5">{selectedApp.major_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Ngày nộp</p>
                <p className="text-sm text-on-surface mt-0.5">
                  {selectedApp.submitted_at ? new Date(selectedApp.submitted_at).toLocaleString("vi-VN") : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Người duyệt</p>
                <p className="text-sm text-on-surface mt-0.5">{selectedApp.reviewer_name || "--"}</p>
              </div>
              {selectedApp.reject_reason && (
                <div className="col-span-2">
                  <p className="text-xs font-bold text-text-secondary uppercase">Lý do từ chối</p>
                  <p className="text-sm text-error mt-0.5">{selectedApp.reject_reason}</p>
                </div>
              )}
            </div>

            {/* Status history */}
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Lịch sử thay đổi trạng thái</h4>
              {statusLogs.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-4">Chưa có lịch sử thay đổi</p>
              ) : (
                <div className="relative pl-6 space-y-4">
                  {statusLogs.map((log, idx) => (
                    <div key={log.id || idx} className="relative">
                      <div className="absolute left-[-18px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{
                        backgroundColor:
                          log.new_status === "REJECTED" || log.new_status === "FAILED" ? "#C23934" :
                          log.new_status === "APPROVED" || log.new_status === "PASSED" ? "#04844B" : "#00658e",
                      }} />
                      {idx < statusLogs.length - 1 && (
                        <div className="absolute left-[-13.5px] top-3.5 bottom-[-16px] w-px bg-hairline" />
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-xs font-bold ${getStatusStyle(log.new_status).bg} ${getStatusStyle(log.new_status).text} border ${getStatusStyle(log.new_status).border}`}>
                          {STATUS_DISPLAY[log.new_status] || log.new_status}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {new Date(log.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{log.note || "Không có ghi chú"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedApp.status !== "PASSED" && selectedApp.status !== "FAILED" && (
              <div className="flex justify-end gap-sm pt-2 border-t border-border">
                <button
                  className="bg-primary hover:bg-primary-hover text-on-primary px-lg py-sm rounded-full text-sm font-bold transition-all"
                  onClick={() => openUpdate(selectedApp)}
                >
                  <span className="material-symbols-outlined text-[18px] mr-1">check_circle</span>
                  Xử lý hồ sơ
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={<span className="font-bold text-text-primary">Cập nhật trạng thái hồ sơ</span>}
        open={updateOpen}
        onCancel={() => setUpdateOpen(false)}
        onOk={handleUpdate}
        confirmLoading={updating}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-text-secondary">
            Hồ sơ: <span className="font-bold text-text-primary">{selectedApp?.application_code}</span>
          </p>
          <div>
            <p className="text-xs font-bold text-text-primary mb-1.5">Trạng thái mới</p>
            <Select
              value={newStatus}
              onChange={setNewStatus}
              className="w-full"
              options={[
                { value: "PENDING_REVIEW" as ApplicationStatus, label: "Chờ duyệt" },
                { value: "APPROVED" as ApplicationStatus, label: "Đã duyệt" },
                { value: "REJECTED" as ApplicationStatus, label: "Từ chối" },
                { value: "PASSED" as ApplicationStatus, label: "Đã trúng tuyển" },
                { value: "FAILED" as ApplicationStatus, label: "Không đỗ" },
              ]}
            />
          </div>
          {(newStatus === "REJECTED" || newStatus === "FAILED") && (
            <div>
              <p className="text-xs font-bold text-text-primary mb-1.5">
                Lý do <span className="text-error">*</span>
              </p>
              <textarea
                className="w-full border-hairline rounded-lg px-md py-sm focus:ring-primary-soft focus:border-primary min-h-[80px]"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối/không đỗ..."
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Batch Update Modal */}
      <Modal
        title={<span className="font-bold text-text-primary">Xử lý hàng loạt ({selectedIds.size} hồ sơ)</span>}
        open={batchUpdateOpen}
        onCancel={() => setBatchUpdateOpen(false)}
        onOk={handleBatchUpdate}
        confirmLoading={batchUpdating}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-text-secondary">
            Xét duyệt <span className="font-bold text-text-primary">{selectedIds.size}</span> hồ sơ
          </p>
          <div>
            <p className="text-xs font-bold text-text-primary mb-1.5">Trạng thái mới</p>
            <Select
              value={batchStatus}
              onChange={setBatchStatus}
              className="w-full"
              options={[
                { value: "APPROVED" as ApplicationStatus, label: "Đã duyệt" },
                { value: "REJECTED" as ApplicationStatus, label: "Từ chối" },
                { value: "PASSED" as ApplicationStatus, label: "Đã trúng tuyển" },
                { value: "FAILED" as ApplicationStatus, label: "Không đỗ" },
              ]}
            />
          </div>
          {(batchStatus === "REJECTED" || batchStatus === "FAILED") && (
            <div>
              <p className="text-xs font-bold text-text-primary mb-1.5">
                Lý do <span className="text-error">*</span>
              </p>
              <textarea
                className="w-full border-hairline rounded-lg px-md py-sm focus:ring-primary-soft focus:border-primary min-h-[80px]"
                rows={3}
                value={batchRejectReason}
                onChange={(e) => setBatchRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối/không đỗ..."
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Contextual Banner */}
      <div className="relative overflow-hidden bg-primary-container rounded-xxl p-xxl flex items-center justify-between group">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 space-y-sm flex-1 min-w-0">
          <h4 className="text-lg font-black text-primary">Xử lý hồ sơ ưu tiên?</h4>
          <p className="text-sm text-on-primary-fixed-variant/90">
            Có {pendingCount} hồ sơ thuộc diện chờ duyệt chưa được phê duyệt. Hãy kiểm tra các hồ sơ này để đảm bảo đúng tiến độ tuyển sinh.
          </p>
          <button
            className="mt-md bg-on-primary text-on-primary-container px-lg py-sm rounded-full text-sm font-bold hover:brightness-110 transition-all flex items-center gap-sm"
            onClick={() => {
              setStatusFilter("PENDING_REVIEW");
              setPage(1);
              filterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Xem danh sách chờ duyệt
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="relative z-10 hidden lg:block">
          <div className="bg-white/20 backdrop-blur-md p-md rounded-xl border border-white/30 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <span className="material-symbols-outlined text-[48px] text-white/80">verified_user</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
