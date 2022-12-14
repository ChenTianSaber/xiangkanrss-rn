/**
 * 首页
 * 展示订阅源的列表页
 */
import React, { Component, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, Image, RefreshControl, DeviceEventEmitter, Platform } from 'react-native'
import { Badge, Colors, ExpandableSection, Hint } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as rssParser from 'react-native-rss-parser'
import { insertChannel, insertRSSItem, queryChannels, queryRSSItemByReadState, updateChannelLastUpdated } from '../database/RealmManager'
import DocumentPicker from 'react-native-document-picker'
import RNFetchBlob from 'rn-fetch-blob'

var moment = require('moment')
var cheerio = require('cheerio')
var xml2js = require('xml2js')

var channelOpmlList = []

/**
 * 所有订阅的未读，想看
 */
const AllSection = ({ navigation, unReadItemsSum, wantReadItemsSum }) => {
    return (
        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#656668', paddingStart: 8 }}>所有订阅</Text>
            <View style={{ width: '100%', height: 56 * 3 + 2, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                {/* 未读 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { readState: 0, title: '所有未读' })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='mail-unread' size={22} color={Colors.blue30} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'未读'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {unReadItemsSum > 0 ? <Badge label={unReadItemsSum} size={16} backgroundColor={Colors.red30} /> : null}
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />
                {/* 想看 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { readState: 2, title: '所有想看' })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='ios-star' size={22} color={Colors.yellow30} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'想看'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {wantReadItemsSum > 0 ? <Badge label={wantReadItemsSum} size={16} backgroundColor={Colors.blue30} /> : null}
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />
                {/* 已读 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { readState: 1, title: '所有已读' })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='ios-star' size={22} color={Colors.yellow30} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'已读'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {wantReadItemsSum > 0 ? <Badge label={wantReadItemsSum} size={16} backgroundColor={Colors.blue30} /> : null}
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

/**
 * 订阅源列表
 * 按照分类展示，可以点击伸缩展示
 * 展开的时候 - 展示每个分类的想看/未读
 * 收缩时 - 展示整个分类的想看/未读
 */
const ChannelList = (props) => {

    const { channelList } = props
    const { unReadItemList } = props

    /**
     * 组装数据，将channel的数据转换成SectionList的数据
     */
    const map = new Map()
    for (channel of channelList) {
        if (map.get(channel.fold) == null || map.get(channel.fold) == undefined) {
            let sum = 0
            for (item of unReadItemList) {
                if (item.channelTitle == channel.title) {
                    sum++
                }
            }
            map.set(channel.fold, [{ data: channel, unReadSum: sum }])
        } else {
            let sum = 0
            for (item of unReadItemList) {
                if (item.channelXmlLink == channel.xmlLink) {
                    sum++
                }
            }
            let list = map.get(channel.fold)
            list.push({ data: channel, unReadSum: sum })
            map.set(channel.fold, list)
        }
    }
    const dataList = []
    channelOpmlList = []
    for (let [key, value] of map) {
        dataList.push({
            sectionName: key,
            list: value
        })
        let outline = []
        for (let { data, _ } of value) {
            outline.push({ $: { title: data.title, htmlUrl: data.htmlLink, type: 'rss', text: data.title, xmlUrl: data.xmlLink } })
        }
        channelOpmlList.push({
            $: {
                title: key,
                text: key
            },
            outline
        })
    }

    renderList = () => {
        let list = []
        for (let item of dataList) {
            list.push(
                <SectionItem item={item} navigation={props.navigation} key={item.sectionName} />
            )
        }
        return list
    }

    /**
     * 可伸缩展开的订阅源Item
     */
    const SectionItem = (props) => {
        const [isExpend, setIsExpend] = useState(true)
        let list = props.item.list
        let sectionName = props.item.sectionName
        let navigation = props.navigation
        let viewList = []

        for (let index = 0; index < list.length; index++) {
            let data = list[index].data
            let unReadSum = list[index].unReadSum
            viewList.push(
                <View style={{ width: '100%' }} key={index}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('RSSList', { channelXmlLink: data.xmlLink, title: data.title, readState: 0 })
                    }} onLongPress={() => {
                        navigation.navigate('EditChannel', { channel: data, items: [], isAdd: false })
                    }} activeOpacity={0.8} style={{ flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: data.icon }} style={{ width: 32, height: 32, backgroundColor: Colors.grey80, borderRadius: 30 }} />
                            <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{data.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.grey20, marginEnd: 8 }}>{unReadSum}</Text>
                            <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                        </View>
                    </TouchableOpacity>
                    {index == list.length - 1 ? null : <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />}
                </View>
            )
        }

        return (
            <View style={{ marginTop: 16 }}>
                <ExpandableSection
                    top={false}
                    expanded={isExpend}
                    sectionHeader={
                        <View style={{ width: '100%', height: 36, paddingStart: 8, paddingEnd: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => {
                                // alert('查看该分类的内容')
                                navigation.navigate('RSSList', { foldName: sectionName ? sectionName : '', title: sectionName ? sectionName : '未分类', readState: 0 })
                            }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grey1 }}>{sectionName ? sectionName : '未分类'}</Text>
                            </TouchableOpacity>
                            <Ionicons name={isExpend ? 'ios-chevron-up' : 'ios-chevron-down'} size={20} color={Colors.grey1} />
                        </View>
                    }
                    onPress={() => setIsExpend(!isExpend)}
                >
                    <View style={{ flex: 1, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                        {viewList}
                    </View>
                </ExpandableSection >
            </View >
        )
    }

    return (
        <View style={{ paddingBottom: 68 + 32 }}>
            {renderList()}
        </View>
    )
}

/**
 * 底部的操作区
 * 可以添加订阅/查看设置
 * 中间是操作tip, 用来做各种提示
 */
class ActionBar extends Component {

    state = { tipView: null, showAddView: false }

    render() {
        return (
            <View style={{ width: '100%', height: 68, backgroundColor: '#f2f2f2', position: 'absolute', bottom: 0 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }} >
                    <Ionicons name={'cog-outline'} size={26} onPress={() => {
                        // this.props.navigation.navigate('Setting')
                        // this.props.navigation.navigate('FoldManager')
                        this.props.navigation.navigate('ScriptManager')
                    }} />
                    <View>{this.state.tipView}</View>
                    <Hint visible={this.state.showAddView} customContent={
                        <View>
                            <TouchableOpacity style={{ padding: 12 }} onPress={() => {
                                this.setState({ showAddView: false })
                                this.props.navigation.navigate('AddChannel')
                            }}>
                                <Text>本地订阅源URL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 12 }} onPress={async () => {
                                try {
                                    const pickerResult = await DocumentPicker.pickSingle({
                                        presentationStyle: 'fullScreen',
                                        copyTo: 'cachesDirectory',
                                    })
                                    console.log('pickSingle->', pickerResult)
                                    RNFetchBlob.fs.readFile(Platform.OS == 'ios' ? pickerResult.fileCopyUri.replace('file://', '') : pickerResult.fileCopyUri, 'utf8').then((data) => {
                                        console.log('成功:\n', data)
                                        // 转成obj
                                        let parseString = xml2js.parseString
                                        parseString(data, async (err, result) => {
                                            console.log('parseString->\n', JSON.stringify(result))
                                            let outlineData = result.opml.body[0].outline
                                            console.log('请求开始')
                                            for (let outline of outlineData) {
                                                console.log('分类——>', outline.$.title)
                                                for (let channel of outline.outline) {
                                                    console.log('订阅源——>', channel.$)
                                                    // 请求channel数据并导入数据库
                                                    // 请求链接
                                                    let response = await fetch(channel.$.xmlUrl)
                                                    let responseData = await response.text()
                                                    // console.log(responseData)
                                                    let rss = await rssParser.parse(responseData)
                                                    // // 展示订阅源的数据
                                                    // console.log(rss.title)
                                                    // console.log(rss.items.length)
                                                    // 请求订阅源的icon
                                                    let webUrl = rss.links[0].url.split("//")[1].split("?")[0].split("/")[0]
                                                    let iconUrl = `https://api.iowen.cn/favicon/${webUrl}.png`
                                                    console.log("iconurl -> ", iconUrl)

                                                    let res = await RNFetchBlob.config({ trusty: true, fileCache: true, appendExt: 'png' }).fetch("GET", iconUrl)
                                                    let status = res.info().status
                                                    if (status == 200) {
                                                        let iconPath = res.path()
                                                        console.log('成功了->', iconPath)
                                                        // 组装数据，进入编辑页面
                                                        let dbChannel = {
                                                            title: rss.title,
                                                            type: rss.type,
                                                            contentType: 0,
                                                            xmlLink: channel.$.xmlUrl,
                                                            htmlLink: rss.links[0].url,
                                                            description: rss.description,
                                                            lastUpdated: moment().format(),
                                                            fold: outline.$.title,
                                                            readMode: 0,
                                                            icon: Platform.OS == 'ios' ? `${iconPath}` : `file://${iconPath}`,
                                                            scriptCode: '',
                                                            scriptTitle: ''
                                                        }
                                                        let items = rss.items
                                                        console.log('channel->', dbChannel)
                                                        console.log('items->', items.length)
                                                        // 存入数据库
                                                        try {
                                                            insertChannel(dbChannel)
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
                                                                        channelXmlLink: dbChannel.xmlLink,
                                                                        channelTitle: dbChannel.title,
                                                                        channelIcon: dbChannel.icon,
                                                                        readState: 0,
                                                                        cover: cover
                                                                    })
                                                                } catch (e) {
                                                                    console.log('保存Item失败->', e)
                                                                }
                                                            }
                                                            console.log('保存成功')
                                                        } catch (e) {
                                                            console.log('保存数据库出错')
                                                        }
                                                    } else {
                                                        console.log('出错了')
                                                    }
                                                }
                                            }
                                            console.log('请求完毕')
                                            // 刷新
                                            DeviceEventEmitter.emit('REFRESH')
                                        })
                                    }).catch((e) => {
                                        console.log('读取失败', e)
                                        alert('失败')
                                    })
                                } catch (e) {
                                    console.log('选择出错->', e)
                                    alert('失败')
                                }
                                this.setState({ showAddView: false })
                            }}>
                                <Text>opml导入</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 12 }} onPress={() => {
                                this.setState({ showAddView: false })
                                // 构建opml文件
                                let outline = channelOpmlList
                                let obj = {
                                    opml: {
                                        $: {
                                            version: '2.0'
                                        },
                                        head: {
                                            title: 'XiangKan'
                                        },
                                        body: {
                                            outline
                                        }
                                    }
                                }
                                let builder = new xml2js.Builder()
                                let xml = builder.buildObject(obj)
                                console.log('obj->xml\n', xml)

                                let filePath = Platform.OS == 'android' ? `${RNFetchBlob.fs.dirs.DownloadDir}/xiangkan.opml` : `${RNFetchBlob.fs.dirs.DocumentDir}/xiangkan.opml`
                                console.log('保存的地址\n', filePath)
                                RNFetchBlob.fs.writeFile(filePath, xml, 'utf8').then(() => {
                                    console.log('写入成功')
                                    alert('成功')
                                }).catch((e) => {
                                    console.log('写入失败->', e)
                                    alert('写入失败，看下权限开了没')
                                })
                            }}>
                                <Text>opml导出</Text>
                            </TouchableOpacity>
                        </View>
                    } color={Colors.white} style={{ paddingEnd: 24 }} position={Hint.positions.TOP} offset={14} useSideTip={false} borderRadius={5} removePaddings={true} onBackgroundPress={() => { this.setState({ showAddView: false }) }}>
                        <View>
                            <Ionicons name={'add-circle-outline'} size={26} onPress={() => {
                                this.setState({ showAddView: true })
                            }} />
                        </View>
                    </Hint>
                </View>
                {Platform.OS == 'ios' ? <View style={{ width: 1, height: 20 }} /> : null}
            </View >
        )
    }
}

class HomePage extends Component {

    state = {
        channelList: [],
        allUnReadItemList: [],
        allWantReadItemList: [],
        refreshing: false
    }
    unReadItemList = []
    wantReadItemList = []
    allChannelList = []

    componentDidMount() {
        this.getChannelData()

        // 监听刷新
        DeviceEventEmitter.addListener('REFRESH', () => {
            this.getChannelData()
        })
    }

    /**
     * 查找数据库数据，更新UI
     */
    getChannelData = () => {
        this.allChannelList = queryChannels()
        this.wantReadItemList = queryRSSItemByReadState(2)
        this.unReadItemList = queryRSSItemByReadState(0)
        console.log('save data -> ', this.allChannelList.length, this.wantReadItemList.length, this.unReadItemList.length)

        this.setState({
            channelList: this.allChannelList,
            allUnReadItemList: this.unReadItemList,
            allWantReadItemList: this.wantReadItemList
        })

        if (this.allChannelList.length > 0) {
            try {
                this.updateTipView(
                    <Text>{`上次更新: ${moment(this.allChannelList[0].lastUpdated).format('YYYY-MM-DD h:mm')}`}</Text>
                )
            } catch (e) {
                console.log('updateTipView error')
            }
        }
    }

    /**
     * 更新底部的Tip
     */
    updateTipView = (view) => {
        this.tipView.setState({ tipView: view })
    }

    /**
     * 刷新订阅源的数据
     */
    refreshChannelData = async () => {
        for (let channel of this.allChannelList) {
            // 变化TipView
            this.updateTipView(
                <Text>{`正在更新：[${this.allChannelList.indexOf(channel) + 1}/${this.allChannelList.length}]`}</Text>
            )
            try {
                let response = await fetch(channel.xmlLink)
                let responseData = await response.text()
                let rssData = await rssParser.parse(responseData)

                console.log('channel rssData请求完毕->', rssData.title, rssData.items.length)

                updateChannelLastUpdated(channel, moment().format())

                for (let item of rssData.items) {
                    let content = item.content ? item.content : (item.description ? item.description : "")
                    let description = content.replace(/<[^>]+>/g, "").replace(/(^\s*)|(\s*$)/g, "").substring(0, 300)

                    // 获取第一张图当封面
                    let htmlParser = cheerio.load(content)
                    let cover = htmlParser('img').attr('src')
                    cover = cover ? cover : ''

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
                        console.log('该Item存储失败，估计是已存在', item.title, e)
                    }
                }
            } catch (e) {
                console.log('更新失败->', channel.title, e)
            }
            this.updateTipView(
                <Text>{`更新完毕: ${moment(this.allChannelList[0].lastUpdated).format('YYYY-MM-DD h:mm')}`}</Text>
            )
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                {this.state.channelList.length > 0 ?
                    <ScrollView style={{ flex: 1, paddingStart: 16, paddingEnd: 16 }} refreshControl={
                        <RefreshControl refreshing={false} onRefresh={() => {
                            if (this.state.refreshing) {
                                return
                            }
                            this.setState({ refreshing: true })
                            this.refreshChannelData()
                            this.setState({ refreshing: false })
                        }} />
                    }>
                        <AllSection navigation={this.props.navigation} unReadItemsSum={this.unReadItemList.length} wantReadItemsSum={this.wantReadItemList.length} />
                        <ChannelList navigation={this.props.navigation} channelList={this.state.channelList} unReadItemList={this.unReadItemList} />
                    </ScrollView> :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 120 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.grey1 }}>这里很空</Text>
                        <Text style={{ fontSize: 14, color: Colors.grey1, marginTop: 4 }}>先点击右下角的按钮添加订阅源吧</Text>
                    </View>}
                <ActionBar ref={(view) => this.tipView = view} navigation={this.props.navigation} />
            </View >
        )
    }

}

export default HomePage