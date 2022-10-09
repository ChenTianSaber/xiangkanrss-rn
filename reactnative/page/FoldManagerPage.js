/**
 * 订阅源内容列表
 */
import React, { Component } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { Colors, Dialog, PanningProvider } from 'react-native-ui-lib'
import { deleteFold, insertFold, queryChannelByFold, queryFolds, updateChannelFold } from '../database/RealmManager'

class FoldManagerPage extends Component {

    state = {
        createFold: false,
        foldList: [],
        inputFoldTitle: ''
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // 查询数据库
        let folds = queryFolds()
        console.log('queryFolds ->', folds)
        this.setState({ foldList: folds })
        this.canSelect = this.props.route.params?.canSelect
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                <Dialog
                    visible={this.state.createFold}
                    onDismiss={() => this.setState({ createFold: false })}
                    panDirection={PanningProvider.Directions.DOWN}
                >
                    {<View style={{ width: '100%', backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
                        <View style={{ width: '100%', borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white', paddingLeft: 6, paddingEnd: 6 }}>
                            <TextInput
                                placeholder={'请输入分类名'}
                                onChangeText={(text) => this.setState({ inputFoldTitle: text })}
                                style={{ backgroundColor: 'white', fontSize: 16, borderRadius: 8, marginBottom: 32 }}
                                defaultValue={this.state.inputFoldTitle}
                            />
                            <Button title="确认" onPress={() => {
                                // 插入数据库
                                try {
                                    insertFold({ title: this.state.inputFoldTitle })
                                } catch (e) {
                                    alert('失败')
                                    console.log('插入失败，可能已存在', e)
                                }
                                this.setState({
                                    inputFoldTitle: '',
                                    createFold: false
                                })
                            }} />
                        </View>
                    </View>}
                </Dialog>
                {/* 添加按钮 */}
                {this.canSelect == true ? <Button title="恢复默认" onPress={() => {
                    this.props.navigation.navigate({
                        name: 'EditChannel',
                        params: { selectData: { title: '' } },
                        merge: true,
                    });
                }} /> : null}
                <Button title="新建分类" onPress={() => {
                    this.setState({ createFold: true })
                }} />

                {/* 分类列表 */}
                <FlatList
                    style={{ flex: 1 }}
                    data={this.state.foldList}
                    renderItem={({ item }) =>
                        <TouchableOpacity onPress={() => {
                            if (this.canSelect == true) {
                                this.props.navigation.navigate({
                                    name: 'EditChannel',
                                    params: { selectData: item },
                                    merge: true,
                                });
                            }
                        }} style={{ width: '100%', height: 56, backgroundColor: 'white', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Text>{item.title}</Text>
                            {this.canSelect == true ? null : <TouchableOpacity style={{ width: 56, height: 56, backgroundColor: Colors.red40 }} onPress={() => {
                                // 删除数据库,并且找出fold对应channel，并重置为空
                                try {
                                    let channels = queryChannelByFold(item.title)
                                    for (let channel of channels) {
                                        updateChannelFold(channel, '')
                                    }
                                    deleteFold(item)
                                } catch (e) {
                                    alert('失败')
                                    console.log('失败，可能已存在', e)
                                }
                                this.setState({
                                    foldList: this.state.foldList
                                })
                            }}>
                                <Text>删除</Text>
                            </TouchableOpacity>}
                        </TouchableOpacity>
                    }
                />
            </View>
        )
    }
}

export default FoldManagerPage