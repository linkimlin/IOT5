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

// 按钮事件监听
document.getElementById('light-on').addEventListener('click', () => sendCommand('A'));
document.getElementById('light-off').addEventListener('click', () => sendCommand('B'));
document.getElementById('light-auto').addEventListener('click', () => sendCommand('H'));

document.getElementById('ac-on').addEventListener('click', () => sendCommand('F'));
document.getElementById('ac-off').addEventListener('click', () => sendCommand('G'));
document.getElementById('ac-auto').addEventListener('click', () => sendCommand('I'));

document.getElementById('curtain-open').addEventListener('click', () => sendCommand('C'));
document.getElementById('curtain-stop').addEventListener('click', () => sendCommand('D'));
document.getElementById('curtain-close').addEventListener('click', () => sendCommand('E'));

// 发送命令到服务器（增强版）
async function sendCommand(command) {
    try {
        console.log('正在发送命令:', command);
        const response = await fetch(`${API_URL}/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: command })
        });

        // 处理非2xx状态码
        if (!response.ok) {
            // 根据响应类型解析错误信息
            const errorContent = response.headers.get('Content-Type')?.includes('application/json')
                ? await response.json()  // JSON错误信息
                : await response.text();  // 文本或HTML错误信息
            
            const errorMsg = `请求失败（状态码${response.status}）: ${JSON.stringify(errorContent)}`;
            throw new Error(errorMsg);
        }

        // 验证响应类型是否为JSON
        if (!response.headers.get('Content-Type')?.includes('application/json')) {
            throw new Error(`无效响应类型: ${response.headers.get('Content-Type')}（预期application/json）`);
        }

        const data = await response.json();
        console.log('命令发送成功:', data);
        updateStatusDisplay(data);
        return data;

    } catch (error) {
        console.error('发送命令错误:', error);
        alert(`命令发送失败：${error.message}`);  // 显示具体错误信息
    }
}

// 更新状态显示
function updateStatusDisplay(data) {
    if (data.lightAuto !== undefined) {
        elements.lightAutoStatus.textContent = data.lightAuto ? '开启' : '关闭';
    }
    if (data.acAuto !== undefined) {
        elements.acAutoStatus.textContent = data.acAuto ? '开启' : '关闭';
    }
}

// 更新传感器数据（增强版）
async function updateSensorData() {
    try {
        const response = await fetch(`${API_URL}/status`);

        // 处理非2xx状态码
        if (!response.ok) {
            const errorContent = response.headers.get('Content-Type')?.includes('application/json')
                ? await response.json()
                : await response.text();
            throw new Error(`获取状态失败（状态码${response.status}）: ${JSON.stringify(errorContent)}`);
        }

        // 验证响应类型
        if (!response.headers.get('Content-Type')?.includes('application/json')) {
            throw new Error(`无效响应类型: ${response.headers.get('Content-Type')}（预期application/json）`);
        }

        const data = await response.json();
        console.log('收到数据:', data);
        
        // 更新传感器数据显示
        elements.temperature.textContent = `${data.temperature} ℃`;
        elements.humidity.textContent = `${data.humidity} %`;
        elements.light.textContent = `${data.light} lux`;
        
        updateStatusDisplay(data);
    } catch (error) {
        console.error('更新数据错误:', error);
        // 可添加UI提示（如显示错误信息到页面）
    }
}

// 定期更新数据
setInterval(updateSensorData, UPDATE_INTERVAL);
updateSensorData();  // 立即执行一次更新 
