import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { combinationApi } from '../../api/combinations';
import type { AdmissionCombination } from '../../types/university';
import ColumnConfig, { loadColumnConfig, orderColumnsByKeys } from '../../components/common/ColumnConfig';
import SearchBar from '../../components/common/SearchBar';

const COLUMN_CONFIG_STORAGE_KEY = 'admin_combinations_visible_columns';
const DEFAULT_COLUMN_KEYS = ['code', 'subject_1', 'subject_2', 'subject_3', 'actions'];
const COLUMN_CONFIG_OPTIONS = [
  { key: 'code', label: 'Mã tổ hợp' },
  { key: 'subject_1', label: 'Môn 1' },
  { key: 'subject_2', label: 'Môn 2' },
  { key: 'subject_3', label: 'Môn 3' },
  { key: 'actions', label: 'Thao tác' },
];

const Combinations = () => {
  const [data, setData] = useState<AdmissionCombination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionCombination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    loadColumnConfig(COLUMN_CONFIG_STORAGE_KEY, DEFAULT_COLUMN_KEYS),
  );
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const stripDiacritics = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = stripDiacritics(search.trim()).toLowerCase();
    return data.filter(
      (c) => {
        const haystack = stripDiacritics(
          `${c.code} ${c.subject_1} ${c.subject_2} ${c.subject_3}`,
        ).toLowerCase();
        return haystack.includes(q);
      },
    );
  }, [data, search]);

  const loadData = async (p: number, size?: number) => {
    const ps = size ?? pageSize;
    setLoading(true);
    try {
      const res = await combinationApi.getAll(p, ps);
      setData(res.data);
      setTotal(res.pagination.total);
      setPage(p);
    } catch {
      message.error('Không thể tải danh sách tổ hợp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: AdmissionCombination) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (combinationId: string) => {
    try {
      await combinationApi.deleteGlobal(combinationId);
      message.success('Xóa tổ hợp thành công');
      loadData(page);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Không thể xóa tổ hợp');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await combinationApi.updateGlobal(editing.id, {
          code: values.code,
          subject_1: values.subject_1,
          subject_2: values.subject_2,
          subject_3: values.subject_3,
        });
        message.success('Cập nhật tổ hợp thành công');
      } else {
        await combinationApi.createGlobal({
          code: values.code,
          subject_1: values.subject_1,
          subject_2: values.subject_2,
          subject_3: values.subject_3,
        });
        message.success('Thêm tổ hợp thành công');
      }
      setModalOpen(false);
      loadData(page);
    } catch (err: unknown) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã tổ hợp',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: AdmissionCombination, b: AdmissionCombination) => a.code.localeCompare(b.code),
      sortOrder: sortField === 'code' ? sortOrder : null,
    },
    {
      title: 'Môn 1',
      dataIndex: 'subject_1',
      key: 'subject_1',
      sorter: (a: AdmissionCombination, b: AdmissionCombination) => a.subject_1.localeCompare(b.subject_1),
      sortOrder: sortField === 'subject_1' ? sortOrder : null,
    },
    {
      title: 'Môn 2',
      dataIndex: 'subject_2',
      key: 'subject_2',
      sorter: (a: AdmissionCombination, b: AdmissionCombination) => a.subject_2.localeCompare(b.subject_2),
      sortOrder: sortField === 'subject_2' ? sortOrder : null,
    },
    {
      title: 'Môn 3',
      dataIndex: 'subject_3',
      key: 'subject_3',
      sorter: (a: AdmissionCombination, b: AdmissionCombination) => a.subject_3.localeCompare(b.subject_3),
      sortOrder: sortField === 'subject_3' ? sortOrder : null,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: AdmissionCombination) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa tổ hợp này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const visibleColumns = orderColumnsByKeys(columns, visibleColumnKeys);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h3 className="font-h3-section-title text-h3-section-title text-text-primary">
          Quản lý Tổ hợp xét tuyển
        </h3>
        <div className="flex items-center gap-sm">
          <SearchBar
            value={search}
            onChange={(v) => setSearch(v)}
            onSearch={() => {}}
            placeholder="Tìm kiếm tổ hợp..."
          />
          <ColumnConfig
            storageKey={COLUMN_CONFIG_STORAGE_KEY}
            options={COLUMN_CONFIG_OPTIONS}
            defaultKeys={DEFAULT_COLUMN_KEYS}
            visibleKeys={visibleColumnKeys}
            onChange={setVisibleColumnKeys}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="!h-10 !rounded-lg !px-md"
          >
            Thêm tổ hợp
          </Button>
        </div>
      </div>

      <Table
        columns={visibleColumns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        onChange={(_pagination, _filters, sorter) => {
          const s = sorter as { field?: string; order?: 'ascend' | 'descend' };
          setSortField(s.field ?? null);
          setSortOrder(s.order ?? null);
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
              loadData(p, size);
            } else {
              loadData(p);
            }
          },
        }}
        className="bg-surface-container-lowest rounded-xxl border border-hairline-soft"
      />

      <Modal
        title={editing ? 'Cập nhật tổ hợp' : 'Thêm tổ hợp mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={480}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Mã tổ hợp"
            rules={[{ required: true, message: 'Vui lòng nhập mã tổ hợp' }]}
          >
            <Input placeholder="VD: A00" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="subject_1"
            label="Môn 1"
            rules={[{ required: true, message: 'Vui lòng nhập môn 1' }]}
          >
            <Input placeholder="VD: Toán" />
          </Form.Item>
          <Form.Item
            name="subject_2"
            label="Môn 2"
            rules={[{ required: true, message: 'Vui lòng nhập môn 2' }]}
          >
            <Input placeholder="VD: Lý" />
          </Form.Item>
          <Form.Item
            name="subject_3"
            label="Môn 3"
            rules={[{ required: true, message: 'Vui lòng nhập môn 3' }]}
          >
            <Input placeholder="VD: Hóa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Combinations;
