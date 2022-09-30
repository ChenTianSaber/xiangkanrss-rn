/**
 * 订阅源内容列表
 */
import React, { useState } from 'react'
import { Text, TouchableOpacity, View, Image, TextInput, DeviceEventEmitter } from 'react-native'
import { Button, Colors, Dialog, PanningProvider, RadioButton, RadioGroup } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { deleteChannel, deleteRSSItems, insertChannel, insertRSSItem, queryAllRSSItemByXmlLink, updateChannelInfo } from '../database/RealmManager'

var cheerio = require('cheerio')

const EditChannelPage = (props) => {

    const { channel, items, isAdd } = props.route.params
    const { navigation } = props
    const [title, setTitle] = useState(channel.title)
    const [comfirmDelete, setComfirmDelete] = useState(false)
    const [readMode, setReadMode] = useState(channel.readMode)
    const [contentType, setContentType] = useState(channel.contentType)

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <Dialog
                visible={comfirmDelete}
                onDismiss={() => setComfirmDelete(false)}
                panDirection={PanningProvider.Directions.DOWN}
            >
                {<View style={{ width: '100%', height: 100, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>删除后会将该订阅源的文章一并删除，确定要删除吗？</Text>
                    <Button label={'是的'} size={Button.sizes.medium} backgroundColor={Colors.red30} onPress={() => {
                        setComfirmDelete(false)
                        // 删除
                        try {
                            let items = queryAllRSSItemByXmlLink(channel.xmlLink)
                            deleteRSSItems(items)
                            deleteChannel(channel)
                            DeviceEventEmitter.emit('REFRESH')
                            navigation.pop()
                            alert('删除成功')
                        } catch (e) {
                            alert('删除失败')
                        }
                    }} />
                </View>}
            </Dialog>
            <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
                <Image source={{ uri: channel.icon }} style={{ width: 46, height: 46, borderRadius: 24 }} />
                <Text style={{ color: Colors.grey20, fontSize: 14, marginTop: 8 }}>{channel.htmlLink}</Text>
                <Text style={{ color: Colors.grey30, fontSize: 12 }}>{channel.xmlLink}</Text>
                {/* 标题 */}
                <View style={{ width: '100%', borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white', paddingLeft: 6, paddingEnd: 6 }}>
                    <TextInput
                        placeholder={'可设置自定义标题'}
                        onChangeText={(text) => setTitle(text)}
                        style={{ backgroundColor: 'white', fontSize: 16, borderRadius: 8 }}
                        defaultValue={title}
                    />
                </View>

                {/* 默认阅读模式 */}
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grey1 }}>默认阅读模式</Text>
                    <RadioGroup initialValue={readMode} onValueChange={(value) => setReadMode(value)} style={{ flexDirection: 'row', marginTop: 12 }}>
                        <RadioButton value={0} label={'RSS内容'} />
                        <RadioButton value={1} label={'网页打开'} style={{ marginStart: 16 }} />
                    </RadioGroup>
                </View>

                {/* 默认阅读源类型 */}
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grey1 }}>订阅源的类型</Text>
                    <RadioGroup initialValue={contentType} onValueChange={(value) => setContentType(value)} style={{ flexDirection: 'row', marginTop: 12 }}>
                        <RadioButton value={0} label={'文章'} />
                        <RadioButton value={1} label={'视频'} style={{ marginStart: 16 }} />
                        <RadioButton value={2} label={'图集'} style={{ marginStart: 16 }} />
                    </RadioGroup>
                </View>

                <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                    setComfirmDelete(true)
                }} style={{ width: '100%', padding: 10, borderRadius: 8, backgroundColor: Colors.red40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 }}>
                    <Ionicons name={'save-outline'} color={Colors.white} size={18} />
                    <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>删除</Text>
                    <View style={{ width: 18 }} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                    // 添加到数据库
                    try {
                        if (isAdd) {
                            // 新增数据
                            channel.title = title
                            channel.readMode = readMode
                            channel.contentType = contentType
                            insertChannel(channel)
                        } else {
                            // 更新数据
                            updateChannelInfo(channel, title, readMode, contentType)
                        }
                        console.log(`保存成功: ${channel.title}`)

                        // 保存Item数据
                        if (isAdd) {
                            for (let item of items) {

                                let content = item.content ? item.content : (item.description ? item.description : "")
                                let description = content.replace(/<[^>]+>/g, "").replace(/(^\s*)|(\s*$)/g, "").substring(0, 300)

                                // 获取第一张图当封面
                                let htmlParser = cheerio.load(content)
                                let cover = htmlParser('img').attr('src')
                                cover = cover ? cover : ''

                                console.log('cover ->', cover)

                                try {
                                    insertRSSItem({
                                        title: item.title,
                                        link: item.links[0].url,
                                        description: description,
                                        content: content,
                                        author: item.authors[0] ? item.authors[0].name : '',
                                        published: item.published ? item.published : moment().format(),
                                        channelXmlLink: channel.xmlLink,
                                        channelTitle: channel.title,
                                        channelIcon: channel.icon,
                                        readState: 0,
                                        cover: cover
                                    })
                                } catch (e) {
                                    console.log('失败->', e)
                                }
                            }
                        }
                        alert('保存成功')
                        DeviceEventEmitter.emit('REFRESH')
                        navigation.pop()
                    } catch (e) {
                        console.log('保存失败', e)
                        alert('保存失败，可能订阅源已存在')
                    }
                }} style={{ width: '100%', padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                    <Ionicons name={'save-outline'} color={Colors.white} size={18} />
                    <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>保存</Text>
                    <View style={{ width: 18 }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default EditChannelPage