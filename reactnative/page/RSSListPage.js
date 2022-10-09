/**
 * 订阅源内容列表
 */
import React, { Component, useEffect, useState } from 'react'
import { SectionList, Text, TouchableOpacity, View, Image, DeviceEventEmitter } from 'react-native'
import { Button, Colors, Dialog, Drawer, PanningProvider } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { queryChannelByFold, queryRSSItemByReadState, queryRSSItemByXmlLinkAndReadState, updateRSSItemReadState } from '../database/RealmManager'

var moment = require('moment')

const SectionItem = ({ item, navigation }) => {

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
            return (
                <Ionicons name='ellipse' size={14} color={Colors.blue30} style={{ paddingStart: 8, paddingEnd: 8, paddingTop: 4 }} />
            )
        } else if (readState == 1) {
            return (
                <Ionicons name='ellipse' size={14} color={Colors.grey50} style={{ paddingStart: 8, paddingEnd: 8, paddingTop: 4 }} />
            )
        } else {
            return (
                <Ionicons name='star' size={14} color={Colors.yellow30} style={{ paddingStart: 8, paddingEnd: 8, paddingTop: 4 }} />
            )
        }

    }

    return (
        <Drawer
            rightItems={
                [{
                    text: '想看', background: Colors.yellow30, onPress: () => {
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
                text: readState != 1 ? '已读' : '未读', background: readState != 0 ? Colors.blue30 : Colors.grey30, onPress: () => {
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
            <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, backgroundColor: Colors.white }} onPress={() => {
                navigation.navigate('Content', { item: item })
            }}>
                <View style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 12, paddingBottom: 12, paddingEnd: 12, flexDirection: 'row' }}>
                    <ReadStateIcon />
                    <View style={{ flex: 1, paddingEnd: 12 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1, color: readState == 1 ? Colors.grey40 : Colors.grey1, marginBottom: 4 }}>{item.title}</Text>
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <Text style={{ fontSize: 15, marginTop: 6, color: readState == 1 ? Colors.grey40 : Colors.grey20, flex: 1 }} numberOfLines={4}>{item.description}</Text>
                            {item.cover ? <Image source={{ uri: item.cover }} style={{ width: 90, height: 60, borderRadius: 6, marginStart: 12, marginTop: 8 }} /> : null}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                            <Text style={{ fontSize: 12, color: readState == 1 ? Colors.grey40 : Colors.grey30 }}>{item.author}</Text>
                            <Text style={{ fontSize: 12, color: readState == 1 ? Colors.grey40 : Colors.grey30 }} numberOfLines={4}>{moment(item.published).format('YYYY-MM-DD h:mm')}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ width: '100%', height: 0.5, backgroundColor: '#e4e4e4', marginStart: 26 }} />
            </TouchableOpacity>
        </Drawer>
    )
}

const SectionTitle = ({ section }) => {
    return (
        <View style={{ padding: 16, paddingStart: 8, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: section.icon }} style={{ width: 18, height: 18, borderRadius: 30 }} />
            <Text style={{ fontSize: 14, color: Colors.grey10, marginStart: 8 }}>{section.title}</Text>
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
                if (i == 0) {
                    dataList.push(
                        {
                            title: item.channelTitle,
                            icon: item.channelIcon,
                            data: [item]
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
                                data: [item]
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
            <View style={{ flex: 1, backgroundColor: Colors.white }}>
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
                                // 除去想看的
                                if (item.readState == 0) {
                                    item.readState = 1
                                    updateRSSItemReadState(item, 1)
                                }
                            }
                        }} />
                    </View>}
                </Dialog>
                <SectionList
                    sections={this.state.sectionList}
                    renderItem={({ item }) => <SectionItem item={item} navigation={this.props.navigation} />}
                    renderSectionHeader={({ section }) => <SectionTitle section={section} />}
                    keyExtractor={(item, index) => item.title}
                />
            </View>
        )
    }
}

export default RSSListPage