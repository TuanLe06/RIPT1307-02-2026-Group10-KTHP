import { useEffect, useState } from "react";
import { Button, Table, Tag } from "antd";
import {
  PlusOutlined,
  BankOutlined,
  BookOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/charts";
import { useTheme } from "../../hooks/useTheme";
import { universityApi } from "../../api/universities";
import { majorApi } from "../../api/majors";
import type { University } from "../../types/university";

interface UniMajorCount {
  university: string;
  code: string;
  count: number;
}

const COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
  "#2f54eb",
  "#a0d911",
];

const Dashboard = () => {
  const { theme } = useTheme();
  const [universities, setUniversities] = useState<University[]>([]);
  const [totalUni, setTotalUni] = useState(0);
  const [totalMajors, setTotalMajors] = useState(0);
  const [majorDist, setMajorDist] = useState<UniMajorCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const uniRes = await universityApi.getAll(1, 100);
        setUniversities(uniRes.data);
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

  const columns = [
    {
      title: "TRƯỜNG",
      key: "name",
      render: (_: unknown, record: University) => (
        <div>
          <p className="font-label text-label text-text-primary font-semibold">
            {record.name}
          </p>
          <p className="text-[13px] text-text-secondary">Mã: {record.code}</p>
        </div>
      ),
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      render: (v: string | null) => (
        <span className="font-body text-body">{v ?? "--"}</span>
      ),
    },
    {
      title: "ĐIỆN THOẠI",
      dataIndex: "phone",
      key: "phone",
      render: (v: string | null) => (
        <span className="font-body text-body">{v ?? "--"}</span>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "ACTIVE" ? "green" : "red"}>
          {v === "ACTIVE" ? "Hoạt động" : "Ngưng"}
        </Tag>
      ),
    },
  ];

  const donutData = majorDist
    .filter((d) => d.count > 0)
    .map((d, i) => ({
      type: d.code,
      value: d.count,
      color: COLORS[i % COLORS.length],
    }));

  const totalValue = donutData.reduce((s, d) => s + d.value, 0);

  const donutConfig = {
    data: donutData,
    angleField: "value",
    colorField: "type",
    color: donutData.map((d) => d.color),
    innerRadius: 0.6,
    radius: 0.9,
    label: {
      text: (d: Record<string, unknown>) => {
        const val = d.value as number;
        const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
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
      items: [{ field: "value", name: "Số ngành" }],
    },
  };

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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-primary hover:!bg-primary-hover !text-on-primary !shadow-md !h-auto !px-5 !py-2.5 !rounded-lg !font-label !text-[14px] flex items-center gap-2 !font-bold"
        >
          Tạo báo cáo mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm relative overflow-hidden">
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

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm relative overflow-hidden">
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

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm relative overflow-hidden">
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

        <div className="bg-primary text-on-primary p-5 rounded-xl shadow-lg relative overflow-hidden">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant">
            <h4 className="font-h4-card-header text-h4-card-header text-text-primary">
              Phân bố ngành học
            </h4>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-[300px] text-text-secondary">
                Đang tải...
              </div>
            ) : donutData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-text-secondary">
                Chưa có dữ liệu
              </div>
            ) : (
              <Pie {...donutConfig} />
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
            <h4 className="font-h4-card-header text-h4-card-header text-text-primary">
              Danh sách trường
            </h4>
            <span className="text-[14px] text-text-secondary">
              Tổng số: <strong className="text-text-primary">{totalUni}</strong>
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={universities}
            rowKey="id"
            loading={loading}
            pagination={false}
            className="[&_.ant-table-thead_.ant-table-cell]:!bg-surface-container-low [&_.ant-table-thead_.ant-table-cell]:!font-table-header [&_.ant-table-thead_.ant-table-cell]:!text-table-header [&_.ant-table-thead_.ant-table-cell]:!text-on-surface-variant [&_.ant-table-thead_.ant-table-cell]:!uppercase [&_.ant-table-tbody_.ant-table-row]:!hover:bg-surface-container-low [&_.ant-table-cell]:!border-b-outline-variant"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
