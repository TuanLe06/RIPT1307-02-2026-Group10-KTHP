import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Spin, Pagination, Select, Row, Col, message } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import axios from '../../api/axios';

interface Application {
  id: number;
  application_code: string;
  candidate_name: string;
  candidate_email: string;
  university_name: string;
  major_name: string;
  status: string;
  submitted_at?: string;
}

const ApplicationManagementPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  useEffect(() => {
    fetchApplications();
  }, [page, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit, ...filters };
      const response = await axios.get('/admin/applications', { params });
      setApplications(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Lỗi khi tải danh sách hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Nháp', color: 'default' },
    SUBMITTED: { label: 'Đã nộp', color: 'blue' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: 'orange' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
    PASSED: { label: 'Đã đỗ', color: 'green' },
    FAILED: { label: 'Không đỗ', color: 'red' },
  };

  const handleViewDetails = async (app: Application) => {
    try {
      const response = await axios.get(`/admin/applications/${app.id}`);
      setSelectedApp(response.data.data);
      setDetailsVisible(true);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết');
    }
  };

  const handleChangeStatus = (app: Application) => {
    setSelectedApp(app);
    form.resetFields();
    setStatusModalVisible(true);
  };

  const handleSubmitStatus = async (values: any) => {
    try {
      if (!selectedApp) return;
      
      await axios.put(`/admin/applications/${selectedApp.id}/status`, {
        status: values.status,
        reject_reason: values.reject_reason,
      });
      
      message.success('Cập nhật trạng thái thành công');
      setStatusModalVisible(false);
      fetchApplications();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'application_code',
      key: 'application_code',
      width: 150,
    },
    {
      title: 'Ứng viên',
      dataIndex: 'candidate_name',
      key: 'candidate_name',
    },
    {
      title: 'Email',
      dataIndex: 'candidate_email',
      key: 'candidate_email',
    },
    {
      title: 'Trường',
      dataIndex: 'university_name',
      key: 'university_name',
    },
    {
      title: 'Ngành',
      dataIndex: 'major_name',
      key: 'major_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: statusMap[status]?.color }}>
          {statusMap[status]?.label || status}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Application) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'SUBMITTED' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleChangeStatus(record)}
            >
              Duyệt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Quản lý Hồ sơ nộp" bordered={false}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => {
                setFilters({ ...filters, status: value });
                setPage(1);
              }}
              options={[
                { label: 'Nháp', value: 'DRAFT' },
                { label: 'Đã nộp', value: 'SUBMITTED' },
                { label: 'Chờ duyệt', value: 'PENDING_REVIEW' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Từ chối', value: 'REJECTED' },
                { label: 'Đã đỗ', value: 'PASSED' },
                { label: 'Không đỗ', value: 'FAILED' },
              ]}
            />
          </Col>
          <Col span={16}>
            <Input.Search
              placeholder="Tìm kiếm theo tên, email, mã hồ sơ..."
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPage(1);
              }}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1400 }}
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

      {/* Details Modal */}
      <Modal
        title="Chi tiết hồ sơ"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApp && (
          <div>
            <p><strong>Mã hồ sơ:</strong> {selectedApp.application_code}</p>
            <p><strong>Ứng viên:</strong> {selectedApp.candidate_name}</p>
            <p><strong>Email:</strong> {selectedApp.candidate_email}</p>
            <p><strong>Trường:</strong> {selectedApp.university_name}</p>
            <p><strong>Ngành:</strong> {selectedApp.major_name}</p>
            <p><strong>Trạng thái:</strong> {statusMap[selectedApp.status]?.label}</p>
            {selectedApp.submitted_at && (
              <p><strong>Ngày nộp:</strong> {new Date(selectedApp.submitted_at).toLocaleString('vi-VN')}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleSubmitStatus}
          layout="vertical"
        >
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Chờ duyệt', value: 'PENDING_REVIEW' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Từ chối', value: 'REJECTED' },
                { label: 'Đã đỗ', value: 'PASSED' },
                { label: 'Không đỗ', value: 'FAILED' },
              ]}
            />
          </Form.Item>
          <Form.Item name="reject_reason" label="Lý do từ chối (nếu áp dụng)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApplicationManagementPage;
