import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Spin, Pagination, Tabs, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../api/axios';

interface University {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: string;
}

interface Major {
  id: number;
  code: string;
  name: string;
  university_id: number;
  status: string;
}

const CatalogManagementPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);

  // University related
  const fetchUniversities = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/universities', {
        params: { page: currentPage, limit },
      });
      setUniversities(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching universities:', error);
      message.error('Lỗi khi tải danh sách trường');
    } finally {
      setLoading(false);
    }
  };

  // Major related
  const fetchMajors = async (universityId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/universities/${universityId}/majors`);
      setMajors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching majors:', error);
      message.error('Lỗi khi tải danh sách ngành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities(page);
  }, [page]);

  // University handlers
  const handleAddUniversity = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleSubmitUniversity = async (values: any) => {
    try {
      if (editingId) {
        await axios.put(`/admin/universities/${editingId}`, values);
        message.success('Cập nhật trường thành công');
      } else {
        await axios.post('/admin/universities', values);
        message.success('Thêm trường thành công');
      }
      setModalVisible(false);
      fetchUniversities(page);
    } catch (error) {
      console.error('Error:', error);
      message.error('Lỗi khi lưu thông tin');
    }
  };

  const handleDeleteUniversity = (id: number) => {
    Modal.confirm({
      title: 'Xóa trường',
      content: 'Bạn có chắc chắn muốn xóa trường này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`/admin/universities/${id}`);
          message.success('Xóa trường thành công');
          fetchUniversities(page);
        } catch (error) {
          message.error('Lỗi khi xóa trường');
        }
      },
    });
  };

  // Major handlers
  const handleAddMajor = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleSubmitMajor = async (values: any) => {
    try {
      if (!selectedUniversity) {
        message.error('Vui lòng chọn trường');
        return;
      }
      
      const data = { ...values, university_id: selectedUniversity };
      
      if (editingId) {
        await axios.put(`/admin/majors/${editingId}`, values);
        message.success('Cập nhật ngành thành công');
      } else {
        await axios.post('/admin/majors', data);
        message.success('Thêm ngành thành công');
      }
      setModalVisible(false);
      if (selectedUniversity) {
        fetchMajors(selectedUniversity);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Lỗi khi lưu thông tin');
    }
  };

  const handleDeleteMajor = (id: number) => {
    Modal.confirm({
      title: 'Xóa ngành',
      content: 'Bạn có chắc chắn muốn xóa ngành này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`/admin/majors/${id}`);
          message.success('Xóa ngành thành công');
          if (selectedUniversity) {
            fetchMajors(selectedUniversity);
          }
        } catch (error) {
          message.error('Lỗi khi xóa ngành');
        }
      },
    });
  };

  const universityColumns = [
    {
      title: 'Mã trường',
      dataIndex: 'code',
      key: 'code',
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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: University) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedUniversity(record.id);
              fetchMajors(record.id);
            }}
          >
            Xem ngành
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setEditingId(record.id);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUniversity(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const majorColumns = [
    {
      title: 'Mã ngành',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên ngành',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Major) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setEditingId(record.id);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMajor(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        items={[
          {
            key: '1',
            label: 'Quản lý Trường',
            children: (
              <Card
                title="Danh sách Trường"
                bordered={false}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUniversity}>
                    Thêm Trường
                  </Button>
                }
              >
                <Spin spinning={loading}>
                  <Table
                    dataSource={universities}
                    columns={universityColumns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                  />
                </Spin>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={(newPage) => setPage(newPage)}
                  />
                </div>
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Quản lý Ngành',
            children: (
              <Card
                title={`Danh sách Ngành ${selectedUniversity ? '(Đã chọn)' : '(Chọn trường)'}`.trim()}
                bordered={false}
                extra={
                  selectedUniversity && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMajor}>
                      Thêm Ngành
                    </Button>
                  )
                }
              >
                {!selectedUniversity ? (
                  <p>Vui lòng chọn một trường để xem danh sách ngành</p>
                ) : (
                  <Spin spinning={loading}>
                    <Table
                      dataSource={majors}
                      columns={majorColumns}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 800 }}
                    />
                  </Spin>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingId ? 'Sửa thông tin' : 'Thêm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={(values) => {
            if (selectedUniversity) {
              handleSubmitMajor(values);
            } else {
              handleSubmitUniversity(values);
            }
          }}
          layout="vertical"
        >
          {!selectedUniversity ? (
            <>
              <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Điện thoại">
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
              <Form.Item name="website" label="Website">
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CatalogManagementPage;
