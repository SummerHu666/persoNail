import {
    Engine, Scene, ArcRotateCamera, Vector3, Vector2,
    PBRMaterial, Color3, DirectionalLight, Color4, AbstractMesh,
    ImportMeshAsync, HDRCubeTexture // <--- 看这里，直接引入函数本身
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export class Personail3DEngine {
    private engine: Engine;
    public scene: Scene;
    private camera: ArcRotateCamera;
    private skinMat: PBRMaterial | null = null;

    // 5 级肤色关键节点（深→浅）
    private static readonly SKIN_TONE_NODES: Color3[] = [
        Color3.FromHexString("#5D4037"),
        Color3.FromHexString("#8D6E63"),
        Color3.FromHexString("#D7A98C"),
        Color3.FromHexString("#EDC9A0"),
        Color3.FromHexString("#FDF3E7"),
    ];

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0, 0, 0, 1);

        // ==========================================
        // 📷 1. 纯参数化控制摄像机
        // ==========================================
        
        // 在这里修改你的完美角度参数！
        const camAlpha = Math.PI / 2;  // 正侧面
        const camBeta = 0;   // 黄金俯视角度
        const roll = 0;
        const camRadius = 1;           // 初始缩放距离

        const targetPosition = new Vector3(0, 0.5, -0.25);
        this.camera = new ArcRotateCamera("MainCamera", camAlpha, camBeta, camRadius, targetPosition, this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.fov = 0.2;
        this.camera.wheelPrecision = 50;

        // 🔒 将最大和最小限制设为同一个值，彻底锁死角度，用户无法再旋转
        this.camera.lowerAlphaLimit = camAlpha ; // 允许向左微转
        this.camera.upperAlphaLimit = camAlpha ; // 允许向右微转

        this.camera.rotation.z = roll-1;
        this.camera.rotation.y = roll+1;

        this.camera.lowerBetaLimit = camBeta;
        this.camera.upperBetaLimit = camBeta;

        // 🔓 仅开放缩放功能，并限制缩放范围防穿模
        this.camera.lowerRadiusLimit = camRadius;
        this.camera.upperRadiusLimit = camRadius;

        // ==========================================
        // 💡 2. 光照与直接加载 HDR
        // ==========================================
        
        const dirLight = new DirectionalLight("dirLight", new Vector3(0.5, -1, 0.5), this.scene);
        dirLight.intensity = 1.0;

        console.log("⏳ 开始请求本地 HDR 环境光...");
        const hdrTexture = new HDRCubeTexture(
            "/ENV.hdr",
            this.scene,
            128,
            false,
            true,
            false,
            true,
            () => {
                console.log("🎉 HDR 环境光加载成功！");
                this.scene.environmentTexture = hdrTexture;
                // 创建毛玻璃效果天球，模糊率 0.1 制造影棚质感
                this.scene.createDefaultSkybox(hdrTexture, true, 1000.0, 0.1);
            },
            (message, exception) => {
                console.error("❌ HDR 加载彻底失败，请检查路径 /assets/ENV.hdr：", message, exception);
            }
        );

        // ... 调用 loadHandModel() 和渲染循环保持不变 ...
        this.loadHandModel();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener('resize', this.onResize);
    }
    

    // ==========================================
    // 异步加载手部模型并赋予材质
    // ==========================================
    private async loadHandModel() {
        // 1. 先准备好那套完美的猫眼材质
        const pbr = new PBRMaterial("catEyeMat", this.scene);
        pbr.albedoColor = new Color3(0.58, 0.0, 0.0); 
        pbr.metallic = 1.0;  
        pbr.roughness = 0.3; 
        pbr.clearCoat.isEnabled = true;
        pbr.clearCoat.intensity = 1.0;   
        pbr.clearCoat.roughness = 0.02;  
        pbr.anisotropy.isEnabled = true;
        pbr.anisotropy.intensity = 1.0;  
        pbr.anisotropy.direction = new Vector2(1, 1); 

        try {
            // 2. 加载 /Hand_Low.glb（由 vite publicDir: 'assets' 托管）
            const result = await ImportMeshAsync("/Hand_Low.glb", this.scene);
            
            // (已移除 setTarget 调用，保持构造时设定的 (0, 1.5, 0) 偏移焦点)

            result.meshes.forEach(mesh => {
                // ⚠️ 精准匹配：只给名为 RN_1 到 RN_5 的网格赋予猫眼材质
                const nailNames = ["RN_1", "RN_2", "RN_3", "RN_4", "RN_5"];
                
                if (nailNames.includes(mesh.name)) {
                    mesh.material = pbr;
                } else if (mesh.name === "RHandMesh") {
                    this.skinMat = new PBRMaterial("skinMat", this.scene);
                    this.skinMat.albedoColor = new Color3(0.8, 0.6, 0.5); // 肤色
                    this.skinMat.roughness = 0.8; // 哑光皮肤
                    this.skinMat.metallic = 0.0;
                    this.skinMat.backFaceCulling = false; // 双面渲染，解决手心镂空
                    this.skinMat.transparencyMode = 0; // OPAQUE
                    this.skinMat.needDepthPrePass = false;
                    mesh.material = this.skinMat;
                } else {
                    if (mesh.material) mesh.material.backFaceCulling = false;
                }
            });

            // 打印 MorphTarget 信息（仅调试）
            result.meshes.forEach(m => {
                const mgr = m.morphTargetManager;
                if (mgr) {
                    const names: string[] = [];
                    for (let i = 0; i < mgr.numTargets; i++) {
                        const target = mgr.getTarget(i);
                        if (target) names.push(target.name);
                    }
                    console.log(`网格 ${m.name} 包含的 MorphTarget:`, names);
                }
            });

        } catch (error) {
            console.error("加载双手模型失败，请检查路径是否正确：/assets/Hand_Low.glb", error);
        }
    }

    // 暴露给 React 的接口保持不变
    public updateCatEyeDirection(x: number, y: number) {
        const mat = this.scene.getMaterialByName("catEyeMat") as PBRMaterial;
        if (mat && mat.anisotropy) {
            mat.anisotropy.direction = new Vector2(x, y);
        }
    }

    public setSkinColor(color: Color3) {
        if (this.skinMat) {
            this.skinMat.albedoColor = color;
        }
    }

    /** 肤色滑块 0~1 → 基于 5 级肤色库线性插值 */
    public setSkinTone(value: number) {
        const nodes = Personail3DEngine.SKIN_TONE_NODES;
        const clamped = Math.max(0, Math.min(1, value));
        const segmentCount = nodes.length - 1; // 4 段
        const segment = clamped * segmentCount;
        const index = Math.min(Math.floor(segment), segmentCount - 1);
        const localT = segment - index;
        const color = Color3.Lerp(nodes[index], nodes[index + 1], localT);
        this.setSkinColor(color);
    }

    /** 环境光（HDR）旋转角度 */
    public setEnvRotation(angle: number) {
        if (this.scene.environmentTexture) {
            this.scene.environmentTexture.rotationY = angle;
        }
    }

    /** 甲片长度滑块 0~1 → Morph Target（指定指甲索引 1-5） */
    public setNailLength(nailIndex: number, value: number) {
        const meshName = `RN_${nailIndex}`;
        const targetName = `R_L${nailIndex}`;
        const mesh = this.scene.getMeshByName(meshName);

        if (mesh && mesh.morphTargetManager) {
            const manager = mesh.morphTargetManager;

            // 遍历查找目标 MorphTarget
            for (let i = 0; i < manager.numTargets; i++) {
                const target = manager.getTarget(i);
                if (target && target.name === targetName) {
                    target.influence = value;
                    return;
                }
            }

            // 未找到时打印所有可用目标便于调试
            const available: string[] = [];
            for (let i = 0; i < manager.numTargets; i++) {
                const t = manager.getTarget(i);
                if (t) available.push(t.name);
            }
            console.warn(`未找到名为 ${targetName} 的 MorphTarget，${meshName} 包含:`, available);
        } else {
            console.error(`无法找到网格 ${meshName} 或其 MorphTargetManager`);
        }
    }

    private onResize = () => { this.engine.resize(); }

    public dispose() {
        window.removeEventListener('resize', this.onResize);
        this.scene.dispose();
        this.engine.dispose();
    }
}