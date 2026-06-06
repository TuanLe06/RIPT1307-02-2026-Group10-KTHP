import { useEffect, useState } from 'react';
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
  Checkbox,
  App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, CloseOutlined } from '@ant-design/icons';
import { majorApi } from '../../api/majors';
import { combinationApi } from '../../api/combinations';
import { useMajorStore } from '../../store/majors';
import type { Major, AdmissionCombination } from '../../types/university';

const Majors = () => {
  const {
    data,
    total,
    page,
    pageSize,
    loading,
    universities,
    selectedUniCode,
    selectedUniId,
    init,
    selectUniversity,
    loadPage,
    setPageSize,
    remove,
  } = useMajorStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Major | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [comboMajor, setComboMajor] = useState<Major | null>(null);
  const [allCombos, setAllCombos] = useState<AdmissionCombination[]>([]);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [comboSubmitting, setComboSubmitting] = useState(false);
  const [comboLoading, setComboLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    init();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldValue('university_id', selectedUniId);
    setModalOpen(true);
  };

  const handleEdit = (record: Major) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (majorId: string) => {
    try {
      await remove(majorId);
      message.success('Xóa ngành thành công');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Không thể xóa ngành');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await majorApi.update(selectedUniId, editing.id, values);
        message.success('Cập nhật ngành thành công');
      } else {
        await majorApi.create(values.university_id, {
          code: values.code,
          name: values.name,
          description: values.description,
          min_score: values.min_score,
        });
        message.success('Thêm ngành thành công');
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

  const handleOpenComboModal = async (record: Major) => {
    setComboMajor(record);
    setComboModalOpen(true);
    setComboLoading(true);
    try {
      const [allRes, assignedRes] = await Promise.all([
        combinationApi.getAllList(),
        combinationApi.getAssigned(selectedUniCode, record.code),
      ]);
      setAllCombos(allRes.data);
      setAssignedIds(assignedRes.data);
      setSelectedIds(assignedRes.data);
    } catch {
      message.error('Không thể tải danh sách tổ hợp');
    } finally {
      setComboLoading(false);
    }
  };

  const handleSaveCombos = async () => {
    if (!comboMajor) return;
    setComboSubmitting(true);
    try {
      await combinationApi.assign(selectedUniCode, comboMajor.code, selectedIds);
      message.success('Cập nhật tổ hợp xét tuyển thành công');
      setComboModalOpen(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(axiosErr?.response?.data?.message || 'Không thể cập nhật tổ hợp');
    } finally {
      setComboSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã ngành',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên ngành',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Điểm chuẩn',
      dataIndex: 'min_score',
      key: 'min_score',
      width: 100,
      render: (v: number | null) => (v != null ? v : '--'),
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
      width: 180,
      render: (_: unknown, record: Major) => (
        <Space>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => handleOpenComboModal(record)}
          >
            Tổ hợp
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa ngành này?"
            description="Hành động này sẽ vô hiệu hóa ngành."
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h3 className="font-h3-section-title text-h3-section-title text-text-primary">
          Quản lý Ngành học
        </h3>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
          <Select
            value={selectedUniCode}
            onChange={selectUniversity}
            className="w-full xs:w-[300px]"
            placeholder="Chọn trường"
            options={universities.map((u) => ({
              value: u.code,
              label: u.name,
            }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm ngành
          </Button>
        </div>
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
              loadPage(p);
            }
          },
        }}
        className="bg-surface-container-lowest rounded-lg shadow-sm"
      />

      <Modal
        title={editing ? 'Cập nhật ngành' : 'Thêm ngành mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={560}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'ACTIVE' }}>
          {!editing && (
            <Form.Item name="university_id" label="Trường" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item
            name="code"
            label="Mã ngành"
            rules={[{ required: true, message: 'Vui lòng nhập mã ngành' }]}
          >
            <Input placeholder="VD: 7480201" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
          >
            <Input placeholder="VD: Công nghệ thông tin" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về ngành học" />
          </Form.Item>
          <Form.Item name="min_score" label="Điểm chuẩn">
            <Input placeholder="VD: 24.5" />
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

      <Modal
        title={comboMajor ? `Chọn tổ hợp xét tuyển cho ngành ${comboMajor.name} (${comboMajor.code})` : 'Chọn tổ hợp xét tuyển'}
        open={comboModalOpen}
        onOk={handleSaveCombos}
        onCancel={() => setComboModalOpen(false)}
        confirmLoading={comboSubmitting}
        width={800}
      >
        <div className="flex flex-col md:flex-row gap-4" style={{ minHeight: 400 }}>
          <div className="flex-1 border rounded-lg p-3">
            <div className="font-medium mb-2 text-text-secondary">Tất cả tổ hợp</div>
            <Checkbox.Group
              value={selectedIds}
              onChange={(checkedValues) => setSelectedIds(checkedValues as string[])}
              className="w-full"
            >
              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                {comboLoading ? (
                  <div className="text-center py-4 text-text-secondary">Đang tải...</div>
                ) : allCombos.length === 0 ? (
                  <div className="text-center py-4 text-text-secondary">Chưa có tổ hợp nào</div>
                ) : (
                  allCombos.map((combo) => (
                    <div
                      key={combo.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedIds((prev) =>
                          prev.includes(combo.id)
                            ? prev.filter((id) => id !== combo.id)
                            : [...prev, combo.id],
                        );
                      }}
                    >
                      <Checkbox value={combo.id} checked={selectedIds.includes(combo.id)} />
                      <span className="font-medium w-16 text-sm">{combo.code}</span>
                      <span className="text-text-secondary text-xs">
                        {combo.subject_1} - {combo.subject_2} - {combo.subject_3}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Checkbox.Group>
          </div>

          <div className="w-full md:w-72 border rounded-lg p-3">
            <div className="font-medium mb-2 text-text-secondary">
              Đã chọn (<span className="text-primary">{selectedIds.length}</span>)
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {selectedIds.length === 0 ? (
                <div className="text-center py-4 text-text-secondary text-sm">
                  Chưa chọn tổ hợp nào
                </div>
              ) : (
                allCombos
                  .filter((c) => selectedIds.includes(c.id))
                  .map((combo) => (
                    <div
                      key={combo.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded bg-primary/10 border border-primary/20"
                    >
                      <div>
                        <div className="font-medium text-sm">{combo.code}</div>
                        <div className="text-text-secondary text-xs">
                          {combo.subject_1} - {combo.subject_2} - {combo.subject_3}
                        </div>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() =>
                          setSelectedIds((prev) => prev.filter((id) => id !== combo.id))
                        }
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Majors;
