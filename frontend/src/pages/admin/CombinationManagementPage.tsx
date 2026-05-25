import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Spin, Select, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../api/axios';

interface AdmissionCombination {
  id: number;
  code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
}

interface MajorCombination {
  id: number;
  major_id: number;
  combination_id: number;
  min_score: number;
  status: string;
  combination_code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
}

interface Major {
  id: number;
  code: string;
  name: string;
}

const CombinationManagementPage: React.FC = () => {
  const [combinations, setCombinations] = useState<AdmissionCombination[]>([]);
  const [majorCombinations, setMajorCombinations] = useState<MajorCombination[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('combinations');

  useEffect(() => {
    fetchCombinations();
    fetchMajors();
  }, []);

  const fetchCombinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/admission-combinations', { params: { limit: 1000 } });
      setCombinations(response.data.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách tổ hợp');
    } finally {
      setLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get('/admin/universities', { params: { limit: 1000 } });
      // Get all majors - you might need to adjust this based on your API
      const allMajors: Major[] = [];
      for (const university of response.data.data) {
        const majorsRes = await axios.get(`/admin/universities/${university.id}/majors`, {
          params: { limit: 1000 },
        });
        allMajors.push(...majorsRes.data.data);
      }
      setMajors(allMajors);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchMajorCombinations = async (majorId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/majors/${majorId}/combinations`);
      setMajorCombinations(response.data.data);
    } catch (error) {
      message.error('Lỗi khi tải tổ hợp của ngành');
    } finally {
      setLoading(false);
    }
  };

  // Combination handlers
  const handleAddCombination = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleSubmitCombination = async (values: any) => {
    try {
      if (selectedMajor) {
        // Adding combination to major
        await axios.post('/admin/major-combinations', {
          major_id: selectedMajor,
          combination_id: values.combination_id,
          min_score: values.min_score,
        });
        message.success('Tổ hợp đã được thêm vào ngành');
        fetchMajorCombinations(selectedMajor);
      } else {
        // Adding new combination
        await axios.post('/admin/admission-combinations', values);
        message.success('Tổ hợp mới đã được tạo');
        fetchCombinations();
      }
      setModalVisible(false);
    } catch (error) {
      message.error('Lỗi khi lưu thông tin');
    }
  };

  const handleDeleteCombination = (id: number) => {
    Modal.confirm({
      title: 'Xóa tổ hợp',
      content: 'Bạn có chắc chắn muốn xóa tổ hợp này?',
      onOk: async () => {
        try {
          await axios.delete(`/admin/major-combinations/${id}`);
          message.success('Tổ hợp đã được xóa');
          if (selectedMajor) {
            fetchMajorCombinations(selectedMajor);
          }
        } catch (error) {
          message.error('Lỗi khi xóa tổ hợp');
        }
      },
    });
  };

  const combinationColumns = [
    {
      title: 'Mã tổ hợp',
      dataIndex: 'code',
      key: 'code',
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
  ];

  const majorCombinationColumns = [
    {
      title: 'Mã tổ hợp',
      dataIndex: 'combination_code',
      key: 'combination_code',
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
      title: 'Điểm tối thiểu',
      dataIndex: 'min_score',
      key: 'min_score',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: MajorCombination) => (
        <Space>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCombination(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Quản lý Tổ hợp xét tuyển" bordered={false}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <Select
              placeholder="Chọn ngành để xem tổ hợp"
              style={{ width: '100%' }}
              allowClear
              onClear={() => {
                setSelectedMajor(null);
                setActiveTab('combinations');
              }}
              onChange={(value) => {
                setSelectedMajor(value);
                setActiveTab('major-combinations');
                fetchMajorCombinations(value);
              }}
              options={majors.map((m) => ({
                label: `${m.code} - ${m.name}`,
                value: m.id,
              }))}
            />
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCombination}
            >
              {selectedMajor ? 'Thêm tổ hợp cho ngành' : 'Thêm tổ hợp mới'}
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {!selectedMajor ? (
            <Table
              dataSource={combinations}
              columns={combinationColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          ) : (
            <Table
              dataSource={majorCombinations}
              columns={majorCombinationColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={selectedMajor ? 'Thêm tổ hợp cho ngành' : 'Thêm tổ hợp mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleSubmitCombination}
          layout="vertical"
        >
          {!selectedMajor ? (
            <>
              <Form.Item name="code" label="Mã tổ hợp" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="subject_1" label="Môn 1" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="subject_2" label="Môn 2" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="subject_3" label="Môn 3" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="combination_id"
                label="Tổ hợp"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn tổ hợp"
                  options={combinations.map((c) => ({
                    label: `${c.code} (${c.subject_1}, ${c.subject_2}, ${c.subject_3})`,
                    value: c.id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="min_score"
                label="Điểm tối thiểu"
                rules={[
                  { required: true },
                  { type: 'number', min: 0, max: 30 },
                ]}
              >
                <Input type="number" step="0.1" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CombinationManagementPage;
