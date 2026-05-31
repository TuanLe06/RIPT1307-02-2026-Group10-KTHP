import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Select } from "antd";
import {
  BankOutlined,
  BookOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/charts";
import { useTheme } from "../../hooks/useTheme";
import { universityApi } from "../../api/universities";
import { majorApi } from "../../api/majors";
import { reportsApi } from "../../api/reports";
import type { StatusStat } from "../../types/university";

interface UniMajorCount {
  university: string;
  code: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#8c8c8c",
  SUBMITTED: "#1677ff",
  PENDING_REVIEW: "#faad14",
  APPROVED: "#52c41a",
  REJECTED: "#ff4d4f",
  PASSED: "#722ed1",
  FAILED: "#fa8c16",
};

const Dashboard = () => {
  const { theme } = useTheme();
  const [totalUni, setTotalUni] = useState(0);
  const [totalMajors, setTotalMajors] = useState(0);
  const [majorDist, setMajorDist] = useState<UniMajorCount[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState<"default" | "desc" | "asc">("default");
  const [topN, setTopN] = useState<number | null>(10);

  const filteredMajorDist = useMemo(() => {
    let data = [...majorDist];
    if (sortOrder !== "default") {
      data.sort((a, b) => (sortOrder === "desc" ? b.count - a.count : a.count - b.count));
    }
    if (topN && topN < data.length) data = data.slice(0, topN);
    return data;
  }, [majorDist, sortOrder, topN]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const uniRes = await universityApi.getAll(1, 100);
        setTotalUni(uniRes.pagination.total);
        let majorCount = 0;
        const dist: UniMajorCount[] = [];
        for (const u of uniRes.data) {
          try {
            const mRes = await majorApi.getByUniversity(u.code, 1, 1);
            majorCount += mRes.pagination.total;
            dist.push({
              university: u.name,
              code: u.code,
              count: mRes.pagination.total,
            });
          } catch {
            dist.push({ university: u.name, code: u.code, count: 0 });
          }
        }
        setTotalMajors(majorCount);
        setMajorDist(dist);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadStatusStats = async () => {
      setStatusLoading(true);
      try {
        const res = await reportsApi.getByStatus();
        if (res.success) {
          setStatusStats(res.data);
        }
      } catch {
        // ignore
      } finally {
        setStatusLoading(false);
      }
    };
    loadStatusStats();
  }, []);

  const statusPieData = statusStats.map((s) => ({
    type: s.status_display,
    value: s.count,
    color: STATUS_COLORS[s.status] || "#8c8c8c",
  }));

  const totalStatusValue = statusPieData.reduce((s, d) => s + d.value, 0);

  const statusPieConfig = {
    data: statusPieData,
    angleField: "value",
    colorField: "type",
    color: statusPieData.map((d) => d.color),
    innerRadius: 0.6,
    radius: 0.9,
    label: {
      text: (d: Record<string, unknown>) => {
        const val = d.value as number;
        const pct = totalStatusValue > 0 ? (val / totalStatusValue) * 100 : 0;
        return `${d.type}\n${pct.toFixed(0)}%`;
      },
      style: { fill: theme === 'dark' ? '#e1e6ed' : '#171c20', fontSize: 11 },
    },
    legend: {
      color: {
        title: false,
        position: "bottom",
        rowPadding: 8,
        label: { style: { fill: theme === 'dark' ? '#9aa3af' : '#706e6b' } },
      },
    },
    tooltip: {
      title: "type",
      items: [{ field: "value", name: "Số lượng" }],
    },
  };

  const statusColumns = [
    {
      title: "Trạng thái",
      dataIndex: "status_display",
      key: "status_display",
      render: (v: string, r: StatusStat) => (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[r.status] }} />
          <span>{v}</span>
        </div>
      ),
    },
    {
      title: "Mã",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
      sorter: (a: StatusStat, b: StatusStat) => b.count - a.count,
    },
    {
      title: "Tỷ lệ",
      dataIndex: "percentage",
      key: "percentage",
      render: (v: number) => `${v}%`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-h2-page-title text-h2-page-title text-text-primary">
            Tổng quan hệ thống
          </h2>
          <p className="text-text-secondary font-body mt-1">
            Chào mừng quay trở lại, đây là dữ liệu mới nhất hôm nay.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-hairline-soft p-5 rounded-xxl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
            <BankOutlined className="text-[64px] text-primary" />
          </div>
          <p className="font-label text-[14px] text-text-secondary font-semibold">
            Trường đại học
          </p>
          <h3 className="text-[38px] font-bold text-text-primary mt-1 leading-tight">
            {loading ? "--" : totalUni}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[13px] text-success font-semibold">
            <CheckCircleOutlined className="text-sm" />
            <span>Đang hoạt động</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-hairline-soft p-5 rounded-xxl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
            <BookOutlined className="text-[64px] text-primary" />
          </div>
          <p className="font-label text-[14px] text-text-secondary font-semibold">
            Ngành học
          </p>
          <h3 className="text-[38px] font-bold text-text-primary mt-1 leading-tight">
            {loading ? "--" : totalMajors}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[13px] text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-base">
              menu_book
            </span>
            <span>Phân bổ theo trường</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-hairline-soft p-5 rounded-xxl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
            <AppstoreOutlined className="text-[64px] text-primary" />
          </div>
          <p className="font-label text-[14px] text-text-secondary font-semibold">
            Tổ hợp xét tuyển
          </p>
          <h3 className="text-[38px] font-bold text-text-primary mt-1 leading-tight">
            37
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[13px] text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-base">
              grid_view
            </span>
            <span>Tổ hợp môn</span>
          </div>
        </div>

        <div className="bg-primary text-on-primary p-5 rounded-xxl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <span className="material-symbols-outlined text-[120px]">
              analytics
            </span>
          </div>
          <p className="font-label text-[14px] opacity-90 font-semibold">
            Hệ thống quản lý tuyển sinh
          </p>
          <h3 className="text-[38px] font-bold mt-1 leading-tight">AdmiSX</h3>
          <p className="text-[13px] mt-2 opacity-80">Sẵn sàng xử lý</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-hairline-soft rounded-xxl">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col sm:flex-row sm:items-center gap-3">
          <h4 className="font-h4-card-header text-h4-card-header text-text-primary shrink-0">
            Phân bố ngành học theo trường
          </h4>
          <div className="flex items-center gap-2 flex-1 ml-auto">
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              size="small"
              className="min-w-[90px]"
              options={[
                { value: "default", label: "Mặc định" },
                { value: "desc", label: "Giảm dần" },
                { value: "asc", label: "Tăng dần" },
              ]}
            />
            <Select
              value={topN}
              onChange={setTopN}
              size="small"
              className="min-w-[80px]"
              options={[
                { value: 10, label: "Top 10" },
                { value: 20, label: "Top 20" },
                { value: 50, label: "Top 50" },
                { value: 100, label: "Tất cả" },
              ]}
            />
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] text-text-secondary">
              Đang tải...
            </div>
          ) : filteredMajorDist.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-text-secondary">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="flex flex-row gap-4">
              <div className="flex-1 min-w-0" style={{ height: 400 }}>
                <Pie
                  data={filteredMajorDist.map((d) => ({ code: d.code, university: d.university, value: d.count }))}
                  angleField="value"
                  colorField="university"
                  innerRadius={0.6}
                  radius={0.9}
                  label={{
                    text: (d: Record<string, unknown>) => {
                      const val = d.value as number;
                      const total = filteredMajorDist.reduce((s, item) => s + item.count, 0);
                      const pct = total > 0 ? (val / total) * 100 : 0;
                      return `${d.code}\n${pct.toFixed(0)}%`;
                    },
                    style: { fill: theme === 'dark' ? '#e1e6ed' : '#171c20', fontSize: 11 },
                  }}
                  legend={{
                    color: {
                      title: false,
                      position: "right",
                      layout: { flexDirection: "column" },
                      rowPadding: 4,
                      label: {
                        style: { fill: theme === 'dark' ? '#9aa3af' : '#706e6b', fontSize: 12 },
                        maxWidth: 200,
                      },
                    },
                  }}
                  tooltip={{
                    title: "university",
                    items: [{ field: "value", name: "Số ngành" }],
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-hairline-soft rounded-xxl">
          <div className="px-5 py-4 border-b border-hairline-soft">
            <h4 className="font-h4-card-header text-h4-card-header text-text-primary">
              Thống kê trạng thái hồ sơ
            </h4>
          </div>
          <div className="p-4">
            {statusLoading ? (
              <div className="flex items-center justify-center h-[300px] text-text-secondary">
                Đang tải...
              </div>
            ) : statusPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-text-secondary">
                Chưa có dữ liệu
              </div>
            ) : (
              <Pie {...statusPieConfig} />
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-surface-container-lowest border border-hairline-soft rounded-xxl">
          <div className="px-5 py-4 border-b border-hairline-soft flex items-center justify-between">
            <h4 className="font-h4-card-header text-h4-card-header text-text-primary">
              Chi tiết theo trạng thái
            </h4>
            <span className="text-[14px] text-text-secondary">
              Tổng số: <strong className="text-text-primary">{statusStats.reduce((s, r) => s + r.count, 0)}</strong>
            </span>
          </div>
          <Table
            columns={statusColumns}
            dataSource={statusStats}
            rowKey="status"
            loading={statusLoading}
            pagination={false}
            className="[&_.ant-table-thead_.ant-table-cell]:!bg-surface-container-low [&_.ant-table-thead_.ant-table-cell]:!font-table-header [&_.ant-table-thead_.ant-table-cell]:!text-table-header [&_.ant-table-thead_.ant-table-cell]:!text-on-surface-variant [&_.ant-table-thead_.ant-table-cell]:!uppercase [&_.ant-table-tbody_.ant-table-row]:!hover:bg-surface-container-low [&_.ant-table-cell]:!border-b-outline-variant"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
