import {
    Table, Divider, Row, Col, Icon, Select, Alert, Popconfirm, message, Card
} from 'antd';
import { connect } from 'dva';
import styles from '../style.less';
import CreateForm from "@/components/CreateForm"
import SearchBox from '@/components/SearchBox';




@connect(({ approval, loading }) => ({
    approval,
    submitting: loading.effects['approval/weiqueryList'],
}))
class WeiWaiChild extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checkedKeys: {
                checked: [], halfChecked: []
            },
            iftype: {
                name: "",
                value: ""
            },
            fv: false,
            fields: {},
            /*初始化 main List */
            postData: {
                "isCurrentUser": "1",
                "pageIndex": 1,  //-----当前页码(必填)
                "pageSize": 10,  //-----每页条数(必填)
                "taskNo": "",                         // 任务编号
                "repairUserName": "",          // 维修工姓名
                "equipmentName": "",         // 设备名称
                "sparePartsName": "",          // 配件名称
                "otherName": "",                // 其他名称
                "startTime": "",                     // 申请委外维修时间(开始时间)
                "endTime": "",                      // 申请委外维修时间(结束时间)
                "auditUserName": "",           // 审批人姓名
                "status": props.postData.status,                          // 状态：0：待审批， 2：已审批， 3：确认返回
                "auditResultType": "",          // 审批结果：0：不通过，1：通过
                "confirmBack": ""                // 是否返回，0：未返回，1：已返回
            },
            postUrl: "weiqueryList",
            curitem: {}
        }
    }

    onCheck = (checkedKeys, info) => {
        message.destroy();
        if (this.state.iftype.liziyuan == 2) {
            message.warn("移动端无法操作")
        } else {
            this.setState({ checkedKeys });
        }

    };


    //设置新状态
    setNewState(type, values, fn) {
        const { dispatch } = this.props;
        dispatch({
            type: 'approval/' + type,
            payload: values
        }).then((res) => {
            if (res) {
                fn ? fn() : null;
            }
        });
    }


    resetData() {
        let { postUrl, postData } = this.state;
        this.setNewState(postUrl, postData, () => {
            this.handleCancel()
        })
    }

    componentDidMount() {
        this.resetData();
    }


    //表单改变
    handleFormChange = (changedFields) => {
        let fields = this.state.fields, obj;
        for (let i in changedFields) {
            obj = changedFields[i]
        }
        if (obj) {
            for (let i in fields) {
                if (i == obj.name) {
                    fields[i].value = obj.value
                    fields[i].name = obj.name
                    fields[i].dirty = obj.dirty
                    fields[i].errors = obj.errors
                    fields[i].touched = obj.touched
                    fields[i].validating = obj.validating
                }
            }
            this.setState({
                fields: fields,
            })
        }

    }

    /*绑定form*/
    saveFormRef = (formRef) => {
        this.formRef = formRef;
    }

    /*关闭*/
    handleCancel = () => {
        this.setState({
            fv: false,
            fields: {
                auditResultType: {
                    value: null,
                    type: "select",
                    title: "审批结果",
                    keys: "auditResultType",
                    requires: true,
                    option: [{ name: "不通过", id: "0" }, { name: "通过", id: "1" }]

                },
                auditOption: {
                    value: null,
                    type: "textarea",
                    title: "审批意见",
                    keys: "auditOption",
                    requires: true,
                }

            },
        });
    }

    /*form 提交*/
    handleCreate = () => {
        const form = this.formRef.props.form;
        let { curitem, iftype } = this.state;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let postData = { ...values, id: curitem.id, thingsType: curitem.thingsType };
            this.setNewState("weiauditExternalRepair", postData, () => {
                message.success("操作成功！");
                this.resetData();
            });

        });
    }

    handleSearch = (selectedKeys, dataIndex, end) => {
        if (end) {
            let start = dataIndex;
            let { postUrl } = this.state;
            this.setState({ postData: { ...this.state.postData, [start]: selectedKeys[0] ? selectedKeys[0] : "", [end]: selectedKeys[1] ? selectedKeys[1] : "" } }, () => {
                this.setNewState(postUrl, this.state.postData)
            });
        } else {
            let { postUrl } = this.state;
            this.setState({ postData: { ...this.state.postData, [dataIndex]: selectedKeys[0] ? selectedKeys[0] : "" } }, () => {
                this.setNewState(postUrl, this.state.postData)
            });
        }
    };

    onRef = (ref) => {
        this.child = ref;
    }

    render() {
        let { postData, postUrl, fv, fields, iftype, curitem } = this.state,
            { weiqueryList, nodeList } = this.props.approval;
        let getsearchbox = (key) => {
            if (this.child) {
                return this.child.getColumnSearchProps(key)
            } else {
                return null
            }
        }, getselectbox = (key, option) => {
            if (this.child) {
                return this.child.getColumnSelectProps(key, option)
            } else {
                return null
            }
        }, gettreeselectbox = (key, option) => {
            if (this.child) {
                return this.child.getColumnTreeSelectProps(key, option)
            } else {
                return null
            }
        }, getdaterangebox = (start, end) => {
            if (this.child) {
                return this.child.getColumnRangeProps(start, end)
            } else {
                return null
            }
        }



        const columns = [
            {
                title: '任务编号',
                dataIndex: 'taskNo',
                key: 'taskNo',
                ...getsearchbox("taskNo"),

            },
            {
                title: '设备名称',
                dataIndex: 'equipmentName',
                key: 'equipmentName',
                ...getsearchbox("equipmentName"),

            },
            {
                title: '配件名称',
                dataIndex: 'sparePartsName',
                key: 'sparePartsName',
                ...getsearchbox("sparePartsName"),

            },
            {
                title: '其他名称',
                dataIndex: 'otherName',
                key: 'otherName',
                ...getsearchbox("otherName"),

            },
            {
                title: '维修工',
                dataIndex: 'repairUserName',
                key: 'repairUserName',
                ...getsearchbox("repairUserName")
            },
            {
                title: '申请时间',
                dataIndex: 'externalRepairTime',
                key: 'externalRepairTime',
                ...getdaterangebox("startTime", "endTime"),

            },
            {
                title: '原因',
                dataIndex: 'reason',
                key: 'reason',

            },

            {
                title: '审批时间',
                dataIndex: 'auditTime',
                key: 'auditTime',

            },
            {
                title: '审批结果',
                dataIndex: 'auditResultTypeName',
                key: 'auditResultTypeName',
                width: 100,
                ...getselectbox("auditResultType", [{ dicName: "不通过", dicKey: "0" }, { dicName: "通过", dicKey: "1" }]),

            },
            {
                title: '审批意见',
                dataIndex: 'auditOption',
                key: 'auditOption',

            },
            {
                title: '是否返回',
                dataIndex: 'confirmBack',
                key: 'confirmBack',
                render: (text) => <span>{text == "0" ? "未返回" : "已返回"}</span>
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (text) => <span>{text == "0" ? "待审批" :
                    text == "2" ? "已审批" :
                        text == "3" ? "确认返回" :
                            ""}</span>,
            },
            {
                title: '委外维修类型',
                dataIndex: 'externalRepairType',
                key: 'externalRepairType',
                width: 120,
                render: (text) => <span style={{ width: "100%", textOverflow: "ellipsis", overflow: "hidden", display: "inline-block", whiteSpace: "nowrap" }}>{text == "0" ? "正常委外维修" : text == "1" ? "不正常委外维修" : ""}</span>
            },
            {
                title: <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    物件类型
                    <a style={{ color: "#f50" }} onClick={() => {
                        this.setState({
                            postData: {
                                "pageIndex": 1,  //-----当前页码(必填)
                                "pageSize": 10,  //-----每页条数(必填)
                                "taskNo": "",                         // 任务编号
                                "repairUserName": "",          // 维修工姓名
                                "equipmentName": "",         // 设备名称
                                "sparePartsName": "",          // 配件名称
                                "otherName": "",                // 其他名称
                                "startTime": "",                     // 申请委外维修时间(开始时间)
                                "endTime": "",                      // 申请委外维修时间(结束时间)
                                "auditUserName": "",           // 审批人姓名
                                "status": "",                          // 状态：0：待审批， 2：已审批， 3：确认返回
                                "auditResultType": "",          // 审批结果：0：不通过，1：通过
                                "confirmBack": ""                // 是否返回，0：未返回，1：已返回
                            }
                        }, () => {
                            this.resetData();
                        })
                    }}>
                        <Icon type="reload" style={{ paddingRight: 4, marginLeft: 8 }} />
                        重置
            </a>
                </span>,
                dataIndex: 'thingsType',
                key: 'thingsType',
                width: 140,
                render: (text) => <span>{text == "0" ? "设备" :
                    text == "1" ? "配件" :
                        "其他"}</span>
            },
        ]


        let pageChange = (page) => {
            this.setState({
                postData: { ...this.state.postData, pageIndex: page }
            }, () => {
                this.setNewState("weiqueryList", this.state.postData);
            })
        }


        const rowClassNameFn = (record, index) => {
            const { curitem } = this.state;
            if (curitem && curitem.id === record.id) {
                return "selectedRow";
            }
            return null;
        };
        return (
            <div>
                <SearchBox onRef={this.onRef} handleSearch={this.handleSearch} postData={this.state.postData}></SearchBox>
                <Card title='委外维修列表' extra={
                    <div>
                        {
                            curitem.id && <span>
                                <a onClick={() => {
                                    this.setState({
                                        iftype: {
                                            name: "审批",
                                            value: "edit"
                                        },
                                        fields: {
                                            auditResultType: {
                                                value: null,
                                                type: "select",
                                                title: "审批结果",
                                                keys: "auditResultType",
                                                requires: true,
                                                option: [{ name: "不通过", id: "0" }, { name: "通过", id: "1" }]

                                            },
                                            auditOption: {
                                                value: null,
                                                type: "textarea",
                                                title: "审批意见",
                                                keys: "auditOption",
                                                requires: true,
                                            }

                                        },
                                    }, () => {
                                        this.setState({
                                            fv: true
                                        })
                                    })
                                }}>审批</a>
                                <Divider type="vertical"></Divider>
                                <Popconfirm
                                    okText="确认"
                                    cancelText="取消"
                                    placement="bottom"
                                    title={"确认返回？"}
                                    onConfirm={() => {
                                        this.setNewState("weiconfigBack", { id: curitem.id }, () => {
                                            let total = this.props.approval.weiqueryList.total,
                                                page = this.props.approval.weiqueryList.pageNum;
                                            if ((total - 1) % 10 == 0) {
                                                page = page - 1
                                            }
                                            this.setState({
                                                postData: { ...this.state.postData, pageIndex: page }
                                            }, () => {
                                                this.resetData();
                                                message.success("返回成功！");
                                            })
                                        })
                                    }}>
                                    <a style={{ color: "#ff4800" }}>确认返回</a>
                                </Popconfirm>
                            </span>

                        }


                    </div>
                }>
                    <Table bordered size="middle"
                        onRow={record => {
                            return {
                                onClick: event => {
                                    this.setState({ curitem: record });
                                }, // 点击行
                            };
                        }}
                        rowClassName={(record, index) => rowClassNameFn(record, index)}
                        scroll={{ x: 1500, y: "59vh" }}
                        loading={this.props.submitting}
                        pagination={{
                            showTotal: total => `共${total}条`, // 分页
                            size: "small",
                            pageSize: 10,
                            showQuickJumper: true,
                            current: weiqueryList.pageNum ? weiqueryList.pageNum : 1,
                            total: weiqueryList.total ? parseInt(weiqueryList.total) : 0,
                            onChange: pageChange,
                        }}
                        rowKey='id'
                        columns={columns}
                        dataSource={weiqueryList.list ? weiqueryList.list : []}
                    >
                    </Table>
                    {
                        fields &&
                        <CreateForm
                            fields={fields}
                            data={{}}
                            iftype={iftype}
                            onChange={this.handleFormChange}
                            wrappedComponentRef={this.saveFormRef}
                            visible={fv}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreate}
                        />
                    }

                </Card>
            </div>
        )
    }


}

export default WeiWaiChild



