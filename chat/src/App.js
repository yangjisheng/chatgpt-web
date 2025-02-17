import './App.css';
import Chat, {Bubble, Progress, toast, useMessages} from '@chatui/core';
import '@chatui/core/dist/index.css';
import '@chatui/core/es/styles/index.less';
import React, {useState} from 'react';
import './chatui-theme.css';
import axios from "axios";
import ReactMarkdown from 'react-markdown'

const defaultQuickReplies = [
    {
        name: '清空会话',
        isNew: true,
        isHighlight: true,
    }
];


const initialMessages = [
    {
        type: 'text',
        content: {text: '您好，我是AI助理，开源于：https://github.com/869413421/chatgpt-web。'},
        user: {avatar: '//gitclone.com/download1/gitclone.png'},
    },
];

let chatContext = [];

function App() {
    const {messages, appendMsg, setTyping} = useMessages(initialMessages);
    const [percentage, setPercentage] = useState(0);


    // clearQuestion 清空文本特殊字符
    function clearQuestion(requestText) {
        requestText = requestText.replace(/\s/g, "");
        const punctuation = ",.;!?，。！？、…";
        const runeRequestText = requestText.split("");
        const lastChar = runeRequestText[runeRequestText.length - 1];
        if (punctuation.indexOf(lastChar) < 0) {
            requestText = requestText + "。";
        }
        return requestText
    }

    // clearQuestion 清空文本换行符号
    function clearReply(reply) {
        // TODO 清洗回复特殊字符
        return reply
    }

    function handleSend(type, val) {
        if (percentage > 0) {
            toast.fail('正在等待上一次回复，请稍后')
            return;
        }
        if (type === 'text' && val.trim()) {
            appendMsg({
                type: 'text',
                content: {text: val},
                position: 'left',
                user: {avatar: '//gitclone.com/download1/user.png'},
            });

            setTyping(true);
            setPercentage(10);
            onGenCode(val);
        }
    }

    function renderMessageContent(msg) {
        const {type, content} = msg;

        switch (type) {
            case 'text':
                let text = content.text
                return <Bubble><ReactMarkdown children={text}/></Bubble>;
            default:
                return null;
        }
    }

    function handleQuickReplyClick(item) {
        if (item.name === "清空会话") {
            window.location.reload()
        }
    }

    function onGenCode(question) {
        question = clearQuestion(question)
        chatContext.push({
            "role": "user",
            "content": question,
        })


        let url = "completion"
        // url = "http://127.0.0.1:8080/completion"
        axios.post(url,
            {
                "messages": chatContext,
            }).then((response) => {
                let reply = clearReply(response.data.data.reply)
                appendMsg({
                    type: 'text',
                    content: {text: reply},
                    user: {avatar: '//gitclone.com/download1/gitclone.png'},
                });
                chatContext = response.data.data.messages
                console.log(chatContext)
                setPercentage(0);
            }
        ).catch(err => {
            // 错误处理
            toast.fail("请求出错，" + err.response.data.errorMsg)
        });
    }

    return (
        <div style={{height: 'calc(100vh - 10px)', marginTop: '-5px'}}>
            <Chat
                navbar={{
                    leftContent: {
                        icon: 'chevron-left',
                        title: 'Back',
                    },
                    rightContent: [
                        {
                            icon: 'apps',
                            title: 'Applications',
                        },
                        {
                            icon: 'ellipsis-h',
                            title: 'More',
                        },
                    ],
                    title: '基于ChatGPT的AI助手',
                }}
                messages={messages}
                renderMessageContent={renderMessageContent}
                quickReplies={defaultQuickReplies}
                onQuickReplyClick={handleQuickReplyClick}
                onSend={handleSend}
            />
            <Progress value={percentage}/>
        </div>
    );
}

export default App;
