import { useEffect, useState } from 'react';
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

const Combinations = () => {
  const [data, setData] = useState<AdmissionCombination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionCombination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

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
    loadData(1);
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
    },
    {
      title: 'Môn 1',
      dataIndex: 'subject_1',
      key: 'subject_1',
    },
    {
      title: 'Môn 2',
      dataIndex: 'subject_2',
      key: 'subject_2',
    },
    {
      title: 'Môn 3',
      dataIndex: 'subject_3',
      key: 'subject_3',
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-h3-section-title text-h3-section-title text-text-primary">
          Quản lý Tổ hợp xét tuyển
        </h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tổ hợp
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
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
        className="bg-surface-container-lowest rounded-lg shadow-sm"
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
