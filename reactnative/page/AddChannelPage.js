/**
 * 订阅源内容列表
 */
import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as rssParser from 'react-native-rss-parser'
import RNFetchBlob from "rn-fetch-blob"

var moment = require('moment')

/**
 * 订阅源链接输入框
 */
const UrlEditTxt = (props) => {

    const [url, setUrl] = useState('')

    useEffect(() => {
        props.onRef(this)
    })

    getUrl = () => {
        return url
    }

    clearUrl = () => {
        setUrl('')
    }

    return (
        <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.grey1, paddingStart: 2, marginTop: 24 }}>请输入订阅源url</Text>
            <Text style={{ fontSize: 14, color: Colors.grey20, paddingStart: 2, marginTop: 6 }}>如果不知道这个url是什么东西的话，可以先上GitHub了解一下RSSHub这个项目。</Text>
            <TextInput
                placeholder={'https://www.ruanyifeng.com/blog/atom.xml'}
                onChangeText={(text) => setUrl(text)}
                style={{ backgroundColor: 'white', color: Colors.grey1, fontSize: 14, padding: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8, marginTop: 24 }}
                defaultValue={url}
            />
        </View>
    )
}

const SearchView = (props) => {

    const [isFetching, setIsFetching] = useState(false)
    const { navigation } = props

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2', padding: 16 }}>
            <UrlEditTxt onRef={(ref) => (this.editText = ref)} />
            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                // 获取链接
                setIsFetching(true)
                let url = this.editText.getUrl()
                // 请求链接
                fetch(url)
                    .then((response) => response.text())
                    .then((responseData) => rssParser.parse(responseData))
                    .then((rss) => {
                        // 展示订阅源的数据
                        console.log(rss.title);
                        console.log(rss.items.length);

                        // 请求订阅源的icon
                        let webUrl = rss.links[0].url.split("//")[1].split("?")[0].split("/")[0]
                        let iconUrl = `https://api.iowen.cn/favicon/${webUrl}.png`
                        console.log("iconurl -> ", iconUrl)

                        RNFetchBlob.config({
                            trusty: true,
                            fileCache: true,
                            appendExt: 'png'
                        }).fetch("GET", iconUrl)
                            .then((res) => {
                                setIsFetching(false)
                                let status = res.info().status
                                if (status == 200) {
                                    let iconPath = res.path()
                                    console.log('成功了->', iconPath)
                                    // 组装数据，进入编辑页面
                                    let channel = {
                                        title: rss.title,
                                        type: rss.type,
                                        contentType: 0,
                                        xmlLink: url,
                                        htmlLink: rss.links[0].url,
                                        description: rss.description,
                                        lastUpdated: moment().format(),
                                        fold: '',
                                        readMode: 0,
                                        icon: Platform.OS == 'ios' ? `${iconPath}` : `file://${iconPath}`
                                    }
                                    let items = rss.items
                                    navigation.navigate('EditChannel', { channel: channel, items: items, isAdd: true })
                                } else {
                                    console.log('出错了')
                                }
                            })
                            .catch((errorMessage, statusCode) => {
                                setIsFetching(false)
                                alert('出错了')
                                console.log(statusCode, errorMessage)
                            });

                    })
                    .catch((error) => {
                        setIsFetching(false)
                        // 出错了
                        alert('出错了')
                        console.log(error)
                    })
            }} style={{ padding: 10, borderRadius: 8, backgroundColor: isFetching ? Colors.grey20 : Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                <Ionicons name={'search-outline'} color={Colors.white} size={18} />
                <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>{isFetching ? '搜寻中...' : '检测'}</Text>
                <View style={{ width: 18 }} />
            </TouchableOpacity>
        </View>
    )
}

const AddChannelPage = ({ route, navigation }) => {
    return (
        <View style={{ flex: 1 }}>
            <SearchView navigation={navigation} />
        </View>
    )
}

export default AddChannelPage