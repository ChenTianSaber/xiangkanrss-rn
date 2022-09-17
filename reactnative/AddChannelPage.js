/**
 * 订阅源内容列表
 */
import React, { useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Colors } from 'react-native-ui-lib'
import { TextField } from 'react-native-ui-lib/src/incubator'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as rssParser from 'react-native-rss-parser'
import Realm from "realm"
import { ChannelScheme } from './DataBase'

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

    return (
        <TextField
            placeholder={'请输入订阅源url'}
            floatingPlaceholder={true}
            onChangeText={(text) => setUrl(text)}
            showCharCounter={false}
            floatOnFocus={false}
            containerStyle={{ marginTop: 16 }}
            fieldStyle={{ backgroundColor: 'white', fontSize: 14, padding: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8 }}
            floatingPlaceholderColor={Colors.grey30}
            floatingPlaceholderStyle={{ height: 42, fontSize: 14 }}
            color={{ color: Colors.grey1 }}
            label={url}
        />
    )
}

const SearchView = (props) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2', padding: 16 }}>
            <UrlEditTxt onRef={(ref) => (this.editText = ref)} />
            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                // 获取链接
                let url = this.editText.getUrl()
                // 请求链接
                fetch(url)
                    .then((response) => response.text())
                    .then((responseData) => rssParser.parse(responseData))
                    .then((rss) => {
                        // 展示订阅源的数据
                        console.log(rss.title);
                        console.log(rss.items.length);
                        props.changeStep(2, rss, url)
                    })
                    .catch((error) => {
                        // 出错了
                        alert('出错了')
                        console.log(error)
                    })
            }} style={{ padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                <Ionicons name={'search-outline'} color={Colors.white} size={18} />
                <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>检测</Text>
                <View style={{ width: 18 }} />
            </TouchableOpacity>
        </View>
    )
}

let realm = null

const AddView = (props) => {

    const { rssData, xmlLink } = props
    const [data, setData] = useState(rssData)

    useEffect(() => {
        openRealm = async () => {
            realm = await Realm.open({
                path: "xiangkan",
                schema: [ChannelScheme],
            })
        }
        openRealm()

        return () => {
            realm && realm.close()
        }
    })

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ color: Colors.grey1, fontWeight: 'bold', fontSize: 18 }}>{data.title}</Text>
            <Text style={{ color: Colors.grey20, fontSize: 14 }}>{data.description}</Text>
            <Text style={{ color: Colors.grey30, fontSize: 12 }}>{data.links[0].url}</Text>

            <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                // 添加到数据库
                try {
                    realm.write(() => {
                        let channel = realm.create("Channel", {
                            title: rssData.title,
                            type: rssData.type,
                            xmlLink: xmlLink,
                            htmlLink: rssData.links[0].url,
                            description: rssData.description,
                            lastUpdated: rssData.lastUpdated,
                            icon: ''
                        })
                        console.log(`保存成功: ${channel.title}`);
                        alert('保存成功')
                    })
                } catch (e) {
                    console.log('保存失败', e)
                    alert('保存失败')
                }
            }} style={{ padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                <Ionicons name={'save-outline'} color={Colors.white} size={18} />
                <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>保存</Text>
                <View style={{ width: 18 }} />
            </TouchableOpacity>
        </View>
    )
}

let rssData = null
let xmlLink = ''

const AddChannelPage = () => {

    const [step, setStep] = useState(1)

    const changeStep = (nextStep, data, link) => {
        rssData = data
        xmlLink = link
        console.log(data)
        setStep(nextStep)
    }

    return (
        <View style={{ flex: 1 }}>
            {step == 1 ? <SearchView changeStep={changeStep} /> : <AddView rssData={rssData} xmlLink={xmlLink} />}
        </View>
    )
}

export default AddChannelPage