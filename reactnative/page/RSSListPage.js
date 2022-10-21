/**
 * 订阅源内容列表
 */
import React, { Component, useEffect, useState } from 'react'
import { SectionList, Text, TouchableOpacity, View, Image, DeviceEventEmitter } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Button, Colors, Dialog, Drawer, PanningProvider } from 'react-native-ui-lib'
import { queryChannelByFold, queryChannelByXmlLink, queryRSSItemByReadState, queryRSSItemByXmlLinkAndReadState, updateRSSItemReadState } from '../database/RealmManager'
import Ionicons from 'react-native-vector-icons/Ionicons'

var moment = require('moment')

const SectionItem = ({ item, navigation, section }) => {

    const [readState, setReadState] = useState(item.readState)

    useEffect(() => {
        let listener = DeviceEventEmitter.addListener('UPDATE_ITEM_READ_STATE', (data) => {
            if (data.title == item.title) {
                console.log('找到了')
                setReadState(data.state)
                try {
                    updateRSSItemReadState(item, data.state)
                } catch (e) {
                    console.log(e)
                    alert('失败')
                }
            }
            // 更新列表，存入本地数据库
        })
        return () => {
            listener && listener.remove()
        }
    })

    const ReadStateIcon = () => {
        if (readState == 0) {
            return null
        } else if (readState == 1) {
            return (
                <View style={{ height: '100%', width: 6, backgroundColor: Colors.grey50, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }} />
            )
        } else {
            return (
                <View style={{ height: '100%', width: 6, backgroundColor: Colors.yellow50, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }} />
            )
        }

    }

    const ListItem = () => {
        if (section.contentType == 1) {
            // 视频
            return (
                <View style={{ flex: 1, backgroundColor: readState == 0 ? Colors.white : (readState == 2 ? Colors.yellow80 : Colors.grey80), padding: 16, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: readState == 1 ? Colors.grey40 : Colors.grey1 }}>{item.title}</Text>
                    <View style={{ width: 240, height: 160, backgroundColor: Colors.grey60, borderRadius: 4, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name='play-circle-outline' size={40} color={Colors.white} />
                    </View>
                </View>
            )
        } else if (section.contentType == 2) {
            // 图集
            return (
                <View style={{ flex: 1, backgroundColor: readState == 0 ? Colors.white : (readState == 2 ? Colors.yellow80 : Colors.grey80), padding: 16, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: readState == 1 ? Colors.grey40 : Colors.grey1 }}>{item.title}</Text>
                    <View style={{ width: 240, height: 160, backgroundColor: Colors.grey60, borderRadius: 4, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name='images' size={32} color={Colors.white} />
                    </View>
                </View>
            )
        } else {
            // 图文
            return (
                <View style={{ flex: 1, backgroundColor: readState == 0 ? Colors.white : (readState == 2 ? Colors.yellow80 : Colors.grey80), padding: 16, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: readState == 1 ? Colors.grey40 : Colors.grey1 }}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', flex: 1, marginTop: 4 }}>
                        <Text style={{ fontSize: 15, marginTop: 6, color: readState == 1 ? Colors.grey40 : Colors.grey20, flex: 1 }} numberOfLines={4}>{item.description}</Text>
                        {item.cover ? <Image source={{ uri: item.cover }} style={{ width: 90, height: 60, borderRadius: 4, marginStart: 12, marginTop: 8 }} /> : null}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <Text style={{ fontSize: 12, color: readState == 1 ? Colors.grey40 : Colors.grey30 }}>{item.author}</Text>
                        <Text style={{ fontSize: 12, color: readState == 1 ? Colors.grey40 : Colors.grey30 }} numberOfLines={4}>{moment(item.published).format('YYYY-MM-DD h:mm')}</Text>
                    </View>
                </View>
            )

        }
    }

    return (
        <Drawer
            rightItems={
                [{
                    text: '想看', background: Colors.yellow30, width: 100, onPress: () => {
                        setReadState(2)
                        try {
                            updateRSSItemReadState(item, 2)
                        } catch (e) {
                            console.log(e)
                            alert('失败')
                        }
                    }
                }]}
            leftItem={{
                text: readState != 1 ? '已读' : '未读', width: 100, background: readState != 1 ? Colors.grey30 : Colors.blue30, onPress: () => {
                    if (readState != 1) {
                        setReadState(1)
                        try {
                            updateRSSItemReadState(item, 1)
                        } catch (e) {
                            console.log(e)
                            alert('失败')
                        }
                    } else {
                        setReadState(0)
                        try {
                            updateRSSItemReadState(item, 0)
                        } catch (e) {
                            console.log(e)
                            alert('失败')
                        }
                    }
                }
            }}
        >
            <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: Colors.grey70 }} onPress={() => {
                // 找到channel，找到scriptCode，然后执行
                let channels = queryChannelByXmlLink(item.channelXmlLink)
                if (channels[0].scriptCode == '') {
                    navigation.navigate('Content', { item: item })
                } else {
                    console.log('执行脚本->', channels[0].scriptCode)
                    eval(channels[0].scriptCode)
                }
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 6, marginBottom: 0, marginTop: 6 }}>
                    <ReadStateIcon />
                    <ListItem />
                </View>
            </TouchableOpacity>
        </Drawer>
    )
}

const SectionTitle = ({ section }) => {
    return (
        <View style={{ paddingTop: 10, paddingLeft: 6, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white }}>
            <Image source={{ uri: section.icon }} style={{ width: 38, height: 38, borderRadius: 30, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 38, backgroundColor: Colors.white }} />
            <Text style={{ fontSize: 15, color: Colors.grey1, marginStart: 8, fontWeight: 'bold' }}>{section.title}</Text>
        </View>
    )
}

class RSSListPage extends Component {

    state = { sectionList: [], markAllReadDialog: false }
    allItemlist = []

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        readState = this.props.route.params.readState
        channelXmlLink = this.props.route.params?.channelXmlLink
        foldName = this.props.route.params?.foldName
        console.log('channelXmlLink->', channelXmlLink)
        if (channelXmlLink != undefined) {
            this.allItemlist = queryRSSItemByXmlLinkAndReadState(channelXmlLink, readState)
        } else if (foldName != undefined) {
            // 找出所有channel，再找出所有items
            let channels = queryChannelByFold(foldName)
            for (let channel of channels) {
                let items = queryRSSItemByXmlLinkAndReadState(channel.xmlLink, readState)
                this.allItemlist.push(...items)
            }
        } else {
            this.allItemlist = queryRSSItemByReadState(readState)
        }
        console.log(this.allItemlist.length)

        // 组装sectionList
        updateSectionData = () => {
            let dataList = []

            for (let i = 0; i < this.allItemlist.length; i++) {
                let item = this.allItemlist[i]
                let channels = queryChannelByXmlLink(item.channelXmlLink)
                if (i == 0) {
                    dataList.push(
                        {
                            title: item.channelTitle,
                            icon: item.channelIcon,
                            data: [item],
                            contentType: channels[0].contentType
                        }
                    )
                } else {
                    if (item.channelTitle == this.allItemlist[i - 1].channelTitle) {
                        dataList[dataList.length - 1].data.push(item)
                    } else {
                        dataList.push(
                            {
                                title: item.channelTitle,
                                icon: item.channelIcon,
                                data: [item],
                                contentType: channels[0].contentType
                            }
                        )
                    }
                }
            }

            this.setState({ sectionList: dataList })
        }
        updateSectionData()

        // 自定义Header
        this.props.navigation.setOptions({
            title: this.props.route.params.title ? this.props.route.params.title : '内容列表',
            headerRight: () => (
                <TouchableOpacity activeOpacity={0.9} onPress={() => {
                    this.setState({ markAllReadDialog: true })
                }}>
                    <Text style={{ color: Colors.green30, fontSize: 16 }}>全部已读</Text>
                </TouchableOpacity>
            )
        })
    }

    componentWillUnmount() {
        // 通知首页刷新
        DeviceEventEmitter.emit('REFRESH')
    }

    render() {
        return (
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.grey70 }}>
                <Dialog
                    visible={this.state.markAllReadDialog}
                    onDismiss={() => this.setState({ markAllReadDialog: false })}
                    panDirection={PanningProvider.Directions.DOWN}
                >
                    {<View style={{ width: '100%', height: 100, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>是否将全部未读标记为已读？</Text>
                        <Button label={'是的'} size={Button.sizes.medium} backgroundColor={Colors.red30} onPress={() => {
                            this.setState({ markAllReadDialog: false })

                            for (item of this.allItemlist) {
                                try {
                                    // 除去想看的
                                    if (item.readState == 0) {
                                        updateRSSItemReadState(item, 1)
                                    }
                                } catch (e) {
                                    console.log('失败->', e)
                                }
                            }
                        }} />
                    </View>}
                </Dialog>
                <SectionList
                    sections={this.state.sectionList}
                    renderItem={({ item, section }) => <SectionItem item={item} navigation={this.props.navigation} section={section} />}
                    renderSectionHeader={({ section }) => <SectionTitle section={section} />}
                    keyExtractor={(item, index) => item.title}
                    stickySectionHeadersEnabled={true}
                    ListFooterComponent={
                        <View style={{ height: 64 }} />
                    }
                />
            </GestureHandlerRootView>
        )
    }
}

export default RSSListPage