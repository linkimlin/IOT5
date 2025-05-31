// 配置参数
const API_URL = 'https://4693-124-64-23-130.ngrok-free.app/api';
const UPDATE_INTERVAL = 1000;  // 更新间隔（毫秒）

// DOM元素
const elements = {
    temperature: document.getElementById('temperature'),
    humidity: document.getElementById('humidity'),
    light: document.getElementById('light'),
    lightAutoStatus: document.getElementById('light-auto-status'),
    acAutoStatus: document.getElementById('ac-auto-status')
};

// 按钮事件监听（保持原有按钮ID的绑定）
document.getElementById('light-on').addEventListener('click', () => sendCommand('A'));
document.getElementById('light-off').addEventListener('click', () => sendCommand('B'));
document.getElementById('light-auto').addEventListener('click', () => sendCommand('H'));

document.getElementById('ac-on').addEventListener('click', () => sendCommand('F'));
document.getElementById('ac-off').addEventListener('click', () => sendCommand('G'));
document.getElementById('ac-auto').addEventListener('click', () => sendCommand('I'));

document.getElementById('curtain-open').addEventListener('click', () => sendCommand('C'));
document.getElementById('curtain-stop').addEventListener('click', () => sendCommand('D'));
document.getElementById('curtain-close').addEventListener('click', () => sendCommand('E'));

// 发送命令到服务器（优化版）
async function sendCommand(command) {
    try {
        console.log('正在发送命令:', command);
        const response = await fetch(`${API_URL}/command`, {
            method: 'POST',  // 强制使用POST
            headers: {
                'Content-Type': 'application/json',  // 关键头信息
            },
            body: JSON.stringify({ command: command })
        });

        // 处理HTTP错误状态码
        if (!response.ok) {
            // 智能解析错误响应内容（优先JSON）
            const errorBody = await (
                response.headers.get('Content-Type')?.includes('application/json') 
                ? response.json() 
                : response.text()
            );
            throw new Error(`请求失败（状态码${response.status}）: ${JSON.stringify(errorBody)}`);
        }

        // 验证响应类型是否为JSON
        if (!response.headers.get('Content-Type')?.includes('application/json')) {
            throw new Error('无效的响应类型，预期为application/json');
        }

        const data = await response.json();
        console.log('命令发送成功:', data);
        
        // 更新状态显示
        updateStatusDisplay(data);
        return data;  // 返回后端响应数据

    } catch (error) {
        console.error('发送命令错误:', error.message);
        alert(`命令发送失败：${error.message}`);  // 统一错误提示
    }
}

// 更新状态显示（保持原有逻辑）
function updateStatusDisplay(data) {
    if (data.lightAuto !== undefined) {
        elements.lightAutoStatus.textContent = data.lightAuto ? '开启' : '关闭';
    }
    if (data.acAuto !== undefined) {
        elements.acAutoStatus.textContent = data.acAuto ? '开启' : '关闭';
    }
}

// 更新传感器数据（保持原有逻辑）
async function updateSensorData() {
    try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('收到数据:', data);
        
        // 更新传感器数据显示
        elements.temperature.textContent = `${data.temperature} ℃`;
        elements.humidity.textContent = `${data.humidity} %`;
        elements.light.textContent = `${data.light} lux`;
        
        // 更新状态显示
        updateStatusDisplay(data);
    } catch (error) {
        console.error('更新数据错误:', error);
    }
}

// 定期更新数据（保持原有逻辑）
setInterval(updateSensorData, UPDATE_INTERVAL);
updateSensorData();  // 立即执行一次更新 
