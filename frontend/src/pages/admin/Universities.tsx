import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { universityApi } from '../../api/universities';
import { useUniversityStore } from '../../store/universities';
import type { University } from '../../types/university';

const Universities = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data, total, page, pageSize, loading, loadPage, setPageSize, deleteUniversity } =
    useUniversityStore();

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: University) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUniversity(id);
      message.success('Xóa trường thành công');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Không thể xóa trường');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await universityApi.update(editing.id, values);
        message.success('Cập nhật trường thành công');
      } else {
        await universityApi.create(values);
        message.success('Thêm trường thành công');
      }
      setModalOpen(false);
      loadPage(page);
    } catch (err: unknown) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (p: number) => {
    loadPage(p);
  };

  const columns = [
    {
      title: 'Mã trường',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên trường',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: University) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa trường này?"
            description="Hành động này sẽ vô hiệu hóa trường."
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h3 className="font-h3-section-title text-h3-section-title text-text-primary">
          Quản lý Trường học
        </h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm trường
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
            } else {
              handlePageChange(p);
            }
          },
        }}
        className="bg-surface-container-lowest rounded-xxl border border-hairline-soft"
      />

      <Modal
        title={editing ? 'Cập nhật trường' : 'Thêm trường mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={640}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'ACTIVE' }}>
          <Form.Item
            name="code"
            label="Mã trường (viết tắt)"
            rules={[{ required: true, message: 'Vui lòng nhập mã trường' }]}
          >
            <Input placeholder="VD: VNUHCM-US" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="VD: Trường Đại học Khoa học Tự nhiên" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Địa chỉ trường" />
          </Form.Item>
          <div className="flex flex-col sm:flex-row gap-4">
            <Form.Item name="phone" label="Điện thoại" className="flex-1">
              <Input placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item name="email" label="Email" className="flex-1">
              <Input placeholder="Email" />
            </Form.Item>
          </div>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về trường" />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                <Select.Option value="INACTIVE">Ngưng</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Universities;
