/**
 * 订阅源内容列表
 */
import React, { Component } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { deleteScript, insertScript, queryChannelByScriptCode, queryScripts, updateChannelScript } from '../database/RealmManager'
import DocumentPicker from 'react-native-document-picker'
import RNFetchBlob from 'rn-fetch-blob'

class ScriptManager extends Component {

    state = {
        scriptList: []
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // 查询数据库
        let scripts = queryScripts()
        console.log('queryScripts ->', scripts)
        this.setState({ scriptList: scripts })
        this.canSelect = this.props.route.params?.canSelect
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                {/* 添加按钮 */}
                {this.canSelect == true ? <Button title="恢复默认" onPress={() => {
                    // 恢复默认
                    this.props.navigation.navigate({
                        name: 'EditChannel',
                        params: {
                            selectScript: { title: '', code: '' }
                        },
                        merge: true,
                    });
                }} /> : null}
                <Button title="添加脚本" onPress={async () => {
                    // 从文件中选择js文件
                    const pickerResult = await DocumentPicker.pickSingle({
                        presentationStyle: 'fullScreen',
                        copyTo: 'cachesDirectory',
                    })
                    console.log('pickSingle->', pickerResult)
                    RNFetchBlob.fs.readFile(pickerResult.fileCopyUri, 'utf8').then((data) => {
                        console.log('成功:\n', data)
                        let scriptData = JSON.parse(data)
                        console.log('title->', scriptData.title)
                        console.log('desc->', scriptData.desc)
                        console.log('code->', scriptData.code)
                        // 存入数据库
                        try {
                            insertScript(scriptData)
                            this.setState({
                                scriptList: this.state.scriptList
                            })
                        } catch (e) {
                            alert('失败')
                            console.log('插入失败，可能已存在', e)
                        }
                    }).catch((e) => {
                        console.log('读取失败', e)
                        alert('失败')
                    })
                }} />

                {/* 分类列表 */}
                <FlatList
                    style={{ flex: 1 }}
                    data={this.state.scriptList}
                    renderItem={({ item }) =>
                        <TouchableOpacity onPress={() => {
                            // 选择
                            this.props.navigation.navigate({
                                name: 'EditChannel',
                                params: {
                                    selectScript: item
                                },
                                merge: true,
                            });
                        }} style={{ width: '100%', height: 56, backgroundColor: 'white', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Text>{item.title}</Text>
                            {this.canSelect == true ? null : <TouchableOpacity style={{ width: 56, height: 56, backgroundColor: Colors.red40 }} onPress={() => {
                                // 删除数据库,并且找出script对应channel，并重置为空
                                try {
                                    let channels = queryChannelByScriptCode(item.code)
                                    for (let channel of channels) {
                                        updateChannelScript(channel, '', '')
                                    }
                                    deleteScript(item)
                                } catch (e) {
                                    alert('失败')
                                    console.log('失败，可能已存在', e)
                                }
                                this.setState({
                                    scriptList: this.state.scriptList
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

export default ScriptManager