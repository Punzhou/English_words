/* CSAPP 中文生词本 · 基础数据层
 * 数据全部内置，网站为纯静态页面，可直接部署到 github.io。
 * 术语译法统一采用《深入理解计算机系统（第 3 版）》中文版常用表述。
 */
window.CSAPP_DATA = (function () {
  "use strict";

  /* ---------- 教材章节（第 3 版） ---------- */
  var CHAPTERS = [
    { id: 1, name: "计算机系统漫游", en: "A Tour of Computer Systems", hint: "本章借 hello 程序的执行串起全书：源文件、编译系统、处理器、存储器层次、操作系统与网络。重点是理解“抽象”以及各部件如何协作。" },
    { id: 2, name: "信息的表示和处理", en: "Representing and Manipulating Information", hint: "本章讨论位、字节、整数与浮点数的表示：无符号数、补码、溢出、字节序、位级运算与 IEEE 浮点。重点理解“信息 = 位 + 上下文”。" },
    { id: 3, name: "程序的机器级表示", en: "Machine-Level Representation of Programs", hint: "本章以 x86-64 汇编讲解数据格式、寄存器、操作数、控制流、过程调用、数组与结构体、缓冲区溢出。重点理解高级语言如何映射为指令。" },
    { id: 4, name: "处理器体系结构", en: "Processor Architecture", hint: "本章用 Y86-64 从零设计流水线处理器：数据通路、组合逻辑、时序逻辑、流水线阶段、冒险与转发、分支预测。" },
    { id: 5, name: "优化程序性能", en: "Optimizing Program Performance", hint: "本章讲如何写出编译器能高效优化的代码：基准测试、每元素周期数、循环展开、向量化、消除内存别名与过程调用开销、阿姆达尔定律。" },
    { id: 6, name: "存储器层次结构", en: "The Memory Hierarchy", hint: "本章讲“越快越小越贵”的存储器金字塔：SRAM/DRAM、高速缓存组织、命中与不命中、替换策略、写回与写直达、局部性与存储器山。" },
    { id: 7, name: "链接", en: "Linking", hint: "本章讲从目标文件到可执行文件：ELF 节、符号与符号表、符号解析、强弱符号、重定位、静态库、共享库与位置无关代码。" },
    { id: 8, name: "异常控制流", en: "Exceptional Control Flow", hint: "本章讲控制流中的突变：异常、中断、陷阱、故障、进程上下文切换、系统调用、信号与非局部跳转。" },
    { id: 9, name: "虚拟内存", en: "Virtual Memory", hint: "本章讲虚拟地址到物理地址的转换：页表、页表项、TLB、缺页、按需分页、内存映射、写时复制、地址空间与内存保护。" },
    { id: 10, name: "系统级 I/O", en: "System-Level I/O", hint: "本章讲 Unix I/O：文件描述符、打开与关闭、读写、不足值、标准 I/O 与带缓冲 I/O、文件元数据与重定向。" },
    { id: 11, name: "网络编程", en: "Network Programming", hint: "本章讲客户端—服务器模型：套接字、IP 地址与端口、TCP/UDP、协议与分组、域名系统、HTTP 请求与响应。" },
    { id: 12, name: "并发编程", en: "Concurrent Programming", hint: "本章讲三种并发构造：进程、I/O 多路复用与线程；互斥锁、信号量、竞争、临界区、死锁、线程安全与可重入。" }
  ];

  /* ---------- 教材术语表 ----------
   * 每条：[英文词, 中文释义, 推荐术语译法, 是否核心概念(1/0), 出现章节]
   * 未列入 DETAILS 的词条，其“中文拓展”由 app.js 依据章节与术语表自动生成。
   */
  var TERMS = [
    // 第 1 章 计算机系统漫游
    ["bit", "二进制位：信息的最小单位，取值只能是 0 或 1。", "位（比特）", 1, "1,2"],
    ["byte", "由 8 个位组成的基本存储单位，也是内存按地址寻址的最小单位。", "字节", 1, "1,2,3,6"],
    ["word", "由若干字节组成的定长数据单位；其长度即字长。", "字", 0, "1,2,3"],
    ["word size", "机器一次处理的整数位数，决定虚拟地址空间的最大范围。", "字长", 0, "1,2"],
    ["program", "为完成特定任务而编写的一组指令与数据的集合。", "程序", 0, "1"],
    ["process", "程序的一次运行实例，拥有独立的地址空间与运行状态。", "进程", 1, "1,8,12"],
    ["thread", "进程内部的一个执行流，与同进程其他线程共享地址空间。", "线程", 1, "1,12"],
    ["instruction", "处理器能够识别并执行的一条基本操作命令。", "指令", 1, "1,3,4"],
    ["compiler", "把高级语言源程序翻译为汇编代码或机器代码的系统程序。", "编译器", 0, "1"],
    ["assembler", "把汇编语言翻译成可重定位机器代码的工具。", "汇编器", 0, "1,3,7"],
    ["linker", "把多个可重定位目标文件合并成可执行文件的工具。", "链接器", 1, "1,7"],
    ["loader", "把可执行文件复制到内存并使之开始运行的系统程序。", "加载器", 0, "1,7,9"],
    ["object file", "编译器或汇编器生成、尚未完成重定位的二进制文件。", "目标文件", 1, "1,3,7"],
    ["executable file", "链接完成、可被加载器装入内存直接运行的文件。", "可执行文件", 1, "1,7"],
    ["operating system", "管理硬件资源、为应用程序提供抽象与服务的系统软件。", "操作系统", 1, "1,8,9,10"],
    ["kernel", "操作系统中常驻内存、拥有最高特权的核心部分。", "内核", 1, "1,8,9"],
    ["system call", "应用程序请求内核服务的受控接口。", "系统调用", 1, "1,8,10"],
    ["abstraction", "隐藏下层实现细节、只暴露必要接口的设计方法。", "抽象", 1, "1,9,10"],
    ["concurrency", "多个执行流在一段时间内交替推进的逻辑现象。", "并发", 1, "1,12"],
    ["parallelism", "多个执行流在同一时刻真正同时运行。", "并行", 1, "1,12"],
    ["cache", "容量小但速度快的存储部件，暂存近期可能再次使用的信息。", "高速缓存", 1, "1,6"],
    ["bus", "在各部件间传送地址、数据和控制信号的公共通道。", "总线", 0, "1,6"],
    ["memory", "存放程序指令与数据的存储部件，通常指主存。", "存储器 / 内存", 1, "1,6,9"],
    ["throughput", "单位时间内完成的工作量，用于衡量系统整体性能。", "吞吐量", 0, "1,5,11"],
    ["latency", "从发出请求到获得结果所经历的时间。", "延迟", 0, "1,5,6"],
    ["context switch", "保存当前执行流状态、恢复另一个执行流状态的过程。", "上下文切换", 1, "1,8,12"],
    ["hello", "教材第 1 章用来贯穿全书的示例程序，用于说明程序从源码到执行的全过程。", "示例程序 hello", 0, "1"],

    // 第 2 章 信息的表示和处理
    ["binary", "只使用 0 和 1 两个数字的计数制，是计算机内部表示的基础。", "二进制", 1, "1,2"],
    ["hexadecimal", "以 16 为基数的计数制，用于紧凑书写位模式。", "十六进制", 1, "2"],
    ["decimal", "以 10 为基数的日常计数制。", "十进制", 0, "2"],
    ["unsigned", "只表示非负整数的编码方式，所有位都用于表示数值。", "无符号数", 1, "2"],
    ["signed", "可表示正数与负数的编码方式，教材中通常采用补码。", "有符号数", 1, "2"],
    ["two's complement", "最高位带负权的整数编码，是现代计算机表示有符号整数的标准方式。", "补码", 1, "2,3"],
    ["sign bit", "有符号数中决定正负的最高位。", "符号位", 0, "2"],
    ["overflow", "运算结果超出该数据类型可表示范围的现象。", "溢出", 1, "2,3"],
    ["bit pattern", "一串按顺序排列的 0 和 1，本身不带类型含义。", "位模式", 0, "2"],
    ["boolean algebra", "以真、假为值，以与、或、非、异或为基本运算的代数体系。", "布尔代数", 0, "2"],
    ["mask", "用特定位模式筛出或保留若干位的技术。", "掩码", 0, "2,3"],
    ["shift", "把一个位模式整体左移或右移若干位的运算。", "移位运算", 0, "2,3"],
    ["sign extension", "把较短有符号数扩展为较长表示时，用符号位填充高位的规则。", "符号扩展", 0, "2,3"],
    ["truncation", "截去高位、只保留低位的转换，可能改变数值。", "截断", 0, "2"],
    ["modulo", "取除法余数的运算；无符号加法本质上按 2 的 w 次幂取模。", "模运算 / 取模", 0, "2"],
    ["endianness", "多字节数据在内存中按字节存放的顺序规则。", "字节序", 1, "2,11"],
    ["little-endian", "低位字节存放在低地址处的字节序，x86-64 采用此方式。", "小端序", 1, "2"],
    ["big-endian", "高位字节存放在低地址处的字节序，网络字节序采用此方式。", "大端序", 1, "2,11"],
    ["floating-point", "用符号位、阶码与尾数近似表示实数的编码方式（IEEE 754）。", "浮点数", 1, "2"],
    ["ieee 754", "规定浮点数格式、舍入与特殊值的国际标准。", "IEEE 754 浮点标准", 0, "2"],
    ["mantissa", "浮点数中表示有效数字的部分，也称有效数。", "尾数 / 有效数", 0, "2"],
    ["exponent", "浮点数中表示数量级（2 的幂次）的部分。", "阶码 / 指数", 0, "2"],
    ["precision", "浮点数可表示有效数字的位数，决定舍入误差大小。", "精度", 0, "2"],
    ["rounding", "把无限精度结果按规则调整为可表示浮点数的过程。", "舍入", 0, "2"],
    ["denormalized", "阶码全为 0 时表示非常接近 0 的非规格化浮点数。", "非规格化数", 0, "2"],
    ["nan", "表示“不是一个数”的特殊浮点值，用于无效运算结果。", "NaN（非数）", 0, "2"],
    ["word size", "机器一次处理的整数位数，决定虚拟地址空间的最大范围。", "字长", 0, "1,2"],

    // 第 3 章 程序的机器级表示
    ["assembly", "用助记符书写、与机器指令基本一一对应的低级语言。", "汇编语言", 1, "1,3"],
    ["assembly code", "汇编器输入或反汇编输出的、人类可读的指令文本。", "汇编代码", 0, "3"],
    ["machine code", "处理器直接执行的二进制指令编码。", "机器代码 / 机器码", 1, "1,3,4"],
    ["isa", "指令集体系结构：指令、寄存器、寻址与异常模型的抽象定义。", "指令集体系结构（ISA）", 1, "3,4"],
    ["x86-64", "教材使用的 64 位 Intel/AMD 指令集体系结构。", "x86-64 体系结构", 0, "3"],
    ["register", "处理器内部容量极小、速度极快的存储单元。", "寄存器", 1, "3,4"],
    ["program counter", "存放下一条将要执行指令地址的寄存器（x86-64 中为 %rip）。", "程序计数器", 1, "3,4"],
    ["stack pointer", "指向运行时栈顶的寄存器（x86-64 中为 %rsp）。", "栈指针", 1, "3"],
    ["operand", "指令所操作的数据或数据位置，可来自立即数、寄存器或内存。", "操作数", 1, "3,4"],
    ["opcode", "指令中指明操作类型（如加法、跳转）的编码字段。", "操作码", 0, "3,4"],
    ["immediate", "直接写在指令中的常数值操作数。", "立即数", 0, "3"],
    ["addressing mode", "由寄存器、偏移量和比例因子组合出有效地址的规则。", "寻址方式", 0, "3"],
    ["condition code", "记录最近一次算术或逻辑运算结果状态的标志位。", "条件码", 0, "3,4"],
    ["conditional branch", "依据条件码决定是否改变控制流的指令。", "条件分支", 1, "3,4"],
    ["jump", "把控制转移到另一条指令的操作。", "跳转", 0, "3"],
    ["procedure", "完成特定功能、可被调用的一段代码，是机器级抽象的重要机制。", "过程", 1, "3"],
    ["call", "把返回地址压栈并跳转到被调过程的指令。", "过程调用指令 call", 0, "3"],
    ["return address", "过程结束后应继续执行的指令地址。", "返回地址", 1, "3"],
    ["stack frame", "一次过程调用在栈上分配的、用于保存局部数据与状态的空间。", "栈帧", 1, "3"],
    ["callee-saved", "由被调用过程负责保存与恢复的寄存器。", "被调用者保存寄存器", 0, "3"],
    ["caller-saved", "由调用者在必要时自行保存的寄存器。", "调用者保存寄存器", 0, "3"],
    ["recursion", "过程直接或间接调用自身的编程方式，依靠栈帧实现多层状态。", "递归", 0, "3"],
    ["pointer", "存放地址的变量；在汇编层表现为一个内存地址值。", "指针", 1, "2,3"],
    ["array", "同类型元素在内存中连续排列的数据结构。", "数组", 0, "3,6"],
    ["struct", "把若干不同类型的字段聚合为一块连续内存的数据结构。", "结构体", 0, "3"],
    ["union", "多个字段共享同一块内存、一次只使用一种解释的数据结构。", "联合体", 0, "3"],
    ["alignment", "要求数据起始地址为其大小的整数倍，以简化硬件访问。", "对齐", 1, "3"],
    ["buffer overflow", "写入数据超出缓冲区边界、覆盖相邻栈内容的漏洞。", "缓冲区溢出", 1, "3"],
    ["stack smashing", "利用缓冲区溢出破坏栈帧（尤其返回地址）的攻击方式。", "栈破坏攻击", 0, "3"],
    ["disassembly", "由机器代码反推出汇编代码的过程。", "反汇编", 0, "3"],
    ["objdump", "教材中用于查看目标文件与反汇编代码的命令行工具。", "objdump 反汇编工具", 0, "3"],

    // 第 4 章 处理器体系结构
    ["pipeline", "把指令执行拆成多个阶段、让多条指令重叠推进的实现技术。", "流水线", 1, "1,4,5"],
    ["stage", "流水线中的一个处理阶段，如取指、译码、执行、访存、写回。", "流水段 / 阶段", 0, "4"],
    ["hazard", "流水线中因数据或控制依赖导致下一条指令无法按时推进的情况。", "冒险", 1, "4"],
    ["stall", "为消除冒险而让流水线暂停一个或多个周期。", "停顿（插入气泡）", 0, "4"],
    ["bubble", "流水线中插入的空操作周期，等同于停顿。", "气泡", 0, "4"],
    ["forwarding", "把尚未写回的结果直接送给后续指令，避免数据冒险造成的停顿。", "转发 / 旁路", 1, "4"],
    ["branch prediction", "在分支结果确定前推测其走向，以减少控制冒险损失。", "分支预测", 1, "4,5"],
    ["speculative execution", "在结果尚未确认前先按推测执行指令，猜错则撤销。", "推测执行", 0, "4"],
    ["clock cycle", "处理器时序的基本时间单位，流水线每周期推进一级。", "时钟周期", 0, "4,5"],
    ["datapath", "处理器中完成取指、运算、访存与写回的数据通路。", "数据通路", 0, "4"],
    ["control logic", "根据指令与状态信号产生各部件控制信号的逻辑。", "控制逻辑", 0, "4"],
    ["combinational logic", "输出只取决于当前输入的数字逻辑，不含存储状态。", "组合逻辑", 0, "4"],
    ["sequential logic", "输出同时取决于当前输入与历史状态的时钟逻辑。", "时序逻辑", 0, "4"],
    ["register file", "处理器中一组可按编号并行读写的通用寄存器。", "寄存器文件", 0, "4"],
    ["alu", "算术逻辑单元：完成加减、位运算与地址计算的组合电路。", "算术逻辑单元（ALU）", 1, "4"],
    ["y86-64", "教材为教学简化设计的指令集体系结构，用于讲解处理器设计。", "Y86-64 教学指令集", 0, "4"],
    ["superscalar", "一个周期内可同时发射多条指令的处理器结构。", "超标量", 0, "4,5"],

    // 第 5 章 优化程序性能
    ["optimization", "在不改变程序语义的前提下减少运行时间或资源消耗。", "性能优化", 1, "5"],
    ["benchmark", "用一组有代表性的程序或数据集衡量与比较性能。", "基准测试", 0, "5"],
    ["profiling", "测量程序各部分的耗时，找出最值得优化的热点。", "性能剖析", 0, "5"],
    ["cpe", "每元素周期数：衡量循环处理单个元素所需的平均时钟周期。", "每元素周期数（CPE）", 1, "5"],
    ["loop unrolling", "一次迭代处理多个元素，减少循环开销并提高指令级并行。", "循环展开", 1, "5"],
    ["simd", "单指令多数据：一条指令并行处理多个数据元素的向量指令。", "SIMD 向量指令", 1, "3,5"],
    ["vectorization", "把标量循环改写为可用向量指令并行处理的形式。", "向量化", 0, "5"],
    ["memory aliasing", "两个指针可能指向同一内存位置，使编译器无法安全重排访存。", "内存别名", 1, "3,5"],
    ["code motion", "把循环中结果不变的表达式移到循环外，避免重复计算。", "代码移动", 0, "5"],
    ["strength reduction", "用代价更低的运算替换高代价运算（如用加法替代乘法）。", "强度削弱", 0, "5"],
    ["common subexpression", "在多个位置重复出现的相同表达式，可只计算一次。", "公共子表达式", 0, "5"],
    ["amdahl's law", "整体加速比受限于无法被优化部分所占的比例。", "阿姆达尔定律", 1, "5,12"],
    ["overhead", "为完成某项功能额外付出的时间或空间代价。", "开销", 0, "1,5,12"],
    ["tradeoff", "在两个互相制约的目标之间取舍，如时间与空间、速度与成本。", "权衡 / 折中", 0, "1,5,6"],

    // 第 6 章 存储器层次结构
    ["memory hierarchy", "按速度、容量、成本把多级存储设备组织成金字塔，让上层缓存下层数据。", "存储器层次结构", 1, "1,6"],
    ["sram", "静态随机访问存储器：速度快、成本高，常用于高速缓存。", "静态随机存取存储器（SRAM）", 0, "6"],
    ["dram", "动态随机访问存储器：密度高、需刷新，通常用作主存。", "动态随机存取存储器（DRAM）", 0, "6"],
    ["cache line", "高速缓存与主存之间传送数据的最小定长单位。", "缓存行 / 缓存块", 1, "6"],
    ["cache block", "见 cache line：缓存中存放数据的基本块。", "缓存块", 0, "6"],
    ["cache hit", "所需数据已在高速缓存中，可直接快速访问。", "缓存命中", 1, "6"],
    ["cache miss", "所需数据不在高速缓存中，必须从下层存储取回。", "缓存不命中", 1, "6"],
    ["hit rate", "命中次数占全部访问次数的比例。", "命中率", 0, "6"],
    ["miss penalty", "一次不命中带来的额外访问时间。", "不命中处罚", 0, "6"],
    ["cold miss", "缓存为空时首次访问某块必然发生的不命中。", "冷不命中 / 强制性不命中", 0, "6"],
    ["conflict miss", "因多个块映射到同一缓存组、相互挤占造成的不命中。", "冲突不命中", 0, "6"],
    ["capacity miss", "工作集大于缓存容量造成的不命中。", "容量不命中", 0, "6"],
    ["associativity", "一个缓存组中可容纳的缓存行数量（组相联度）。", "相联度", 1, "6"],
    ["set", "高速缓存中由若干行组成的分组，地址按索引位映射到组。", "缓存组", 0, "6"],
    ["tag", "地址中用于判断缓存行是否命中目标数据的高位部分。", "标记（tag）", 0, "6,9"],
    ["lru", "优先替换最久未使用缓存行的策略。", "最近最少使用（LRU）替换策略", 1, "6,9"],
    ["replacement policy", "缓存满时决定淘汰哪一行的规则。", "替换策略", 0, "6,9"],
    ["write-back", "只写缓存、直到该行被替换时才写回下层存储的写策略。", "写回", 1, "6"],
    ["write-through", "每次写操作都同时更新缓存与下层存储的写策略。", "写直达 / 直写", 1, "6"],
    ["dirty bit", "标记缓存行是否已被修改、需要在替换时写回的位。", "脏位", 0, "6,9"],
    ["locality", "程序倾向于重复访问相同或相邻数据的性质，是缓存有效的根本原因。", "局部性", 1, "5,6"],
    ["temporal locality", "刚被访问的数据在不久后很可能再次被访问。", "时间局部性", 1, "6"],
    ["spatial locality", "刚被访问的数据附近的数据很可能随后被访问。", "空间局部性", 1, "6"],
    ["stride", "循环中相邻两次访存地址之间的间隔，影响空间局部性。", "步长", 0, "5,6"],
    ["working set", "程序在一段时间内实际频繁访问的页面或数据块集合。", "工作集", 1, "6,9"],
    ["thrashing", "工作集超过缓存或主存容量，导致数据被反复换入换出、性能骤降。", "抖动", 1, "6,9"],
    ["memory mountain", "把不同规模与步长下的访存吞吐率绘制成的三维图形。", "存储器山", 0, "6"],
    ["bandwidth", "单位时间内可传送的数据量。", "带宽", 0, "1,6,11"],
    ["disk", "容量大、速度慢、按块访问的外存设备。", "磁盘", 0, "1,6,9"],
    ["seek time", "磁盘把磁头移到目标磁道所需的时间。", "寻道时间", 0, "6"],

    // 第 7 章 链接
    ["symbol", "目标文件中对函数、全局变量或静态变量的名字引用。", "符号", 1, "3,7"],
    ["symbol table", "记录目标文件定义与引用的符号及其位置信息的数据结构。", "符号表", 1, "7"],
    ["relocation", "把多个目标文件合并后，修正代码与数据中的地址引用。", "重定位", 1, "7"],
    ["static linking", "链接时把库代码完整复制进可执行文件的方式。", "静态链接", 1, "7"],
    ["dynamic linking", "运行时才把共享库装入并解析符号引用的方式。", "动态链接", 1, "7"],
    ["shared library", "可被多个进程共享、在加载或运行时链接的库文件。", "共享库", 1, "7"],
    ["static library", "由多个目标模块打包成的归档文件，链接时只取所需模块。", "静态库", 0, "7"],
    ["archive", "把若干可重定位目标文件打包成 .a 文件的格式。", "归档文件", 0, "7"],
    ["elf", "Linux 下目标文件、可执行文件与共享库统一采用的二进制格式。", "ELF 文件格式", 1, "3,7"],
    ["section", "目标文件中按用途划分的逻辑区域，如 .text、.data、.bss。", "节（section）", 1, "7"],
    ["segment", "加载时按读写执行权限合并、映射到内存的区域。", "段（segment）", 1, "7,9"],
    ["global symbol", "本模块定义、可被其他模块引用的符号。", "全局符号", 0, "7"],
    ["external symbol", "本模块引用、由其他模块定义的符号。", "外部符号", 0, "7"],
    ["strong symbol", "已初始化的全局符号；同名时优先于弱符号。", "强符号", 0, "7"],
    ["weak symbol", "未初始化的全局符号；同名时可能被强符号覆盖。", "弱符号", 0, "7"],
    ["pic", "位置无关代码：可加载到任意地址而无需修改的机器代码。", "位置无关代码（PIC）", 1, "7"],
    ["got", "全局偏移量表：配合 PLT 实现动态符号地址解析。", "全局偏移量表（GOT）", 0, "7"],
    ["plt", "过程链接表：动态链接时用于跳转到共享库函数的跳板。", "过程链接表（PLT）", 0, "7"],
    ["entry point", "程序开始执行的第一条指令地址。", "入口点", 0, "7"],

    // 第 8 章 异常控制流
    ["exception", "处理器状态发生变化时，控制流转移到内核异常处理程序的事件。", "异常", 1, "8"],
    ["exception table", "把异常号映射到对应处理程序入口地址的表。", "异常表", 0, "8"],
    ["interrupt", "来自处理器外部 I/O 设备的异步信号所引发的异常。", "中断", 1, "8,12"],
    ["trap", "由程序主动执行指令引发、用于系统调用的同步异常。", "陷阱", 1, "8"],
    ["fault", "可被修复的同步异常，修复后重新执行当前指令。", "故障", 1, "8,9"],
    ["abort", "不可恢复的严重错误所引发的异常，通常终止程序。", "终止", 0, "8"],
    ["signal", "内核或进程用来通知某类事件发生的小消息。", "信号", 1, "8,12"],
    ["handler", "事件发生时被调用、负责处理该事件的函数。", "处理程序", 0, "8,12"],
    ["context", "进程或线程运行所需的完整状态：寄存器、栈、地址空间等。", "上下文", 1, "1,8,12"],
    ["kernel mode", "可执行特权指令、访问全部地址空间的处理器状态。", "内核模式 / 管态", 1, "8,9"],
    ["user mode", "权限受限、不能直接访问内核资源的处理器状态。", "用户模式 / 目态", 1, "8,9"],
    ["fork", "创建与父进程几乎完全相同的子进程的系统调用。", "fork（创建进程）", 0, "8,12"],
    ["execve", "用新程序替换当前进程地址空间与代码的系统调用。", "execve（加载并运行程序）", 0, "8"],
    ["zombie process", "已终止但尚未被父进程回收的进程。", "僵尸进程", 0, "8"],
    ["reap", "父进程回收已终止子进程资源的操作。", "回收（子进程）", 0, "8"],
    ["job control", "shell 在前台与后台作业之间切换的机制。", "作业控制", 0, "8"],
    ["race", "结果依赖于多个执行流相对时序的现象。", "竞争", 1, "8,12"],
    ["nonlocal jump", "绕过常规调用栈、直接跳转到先前保存执行点的控制转移。", "非局部跳转", 0, "8"],

    // 第 9 章 虚拟内存
    ["virtual memory", "为每个进程提供一致、独立地址空间的抽象，并把地址转换交给硬件与内核。", "虚拟内存", 1, "1,9"],
    ["virtual address", "程序使用的地址，需经地址转换才能得到物理地址。", "虚拟地址", 1, "3,9"],
    ["physical address", "主存硬件实际使用的地址。", "物理地址", 1, "9"],
    ["address translation", "把虚拟地址映射为物理地址的硬件过程。", "地址转换", 1, "9"],
    ["address space", "一个进程可使用的全部地址的集合。", "地址空间", 1, "1,8,9"],
    ["mmu", "内存管理单元：借助页表完成虚拟地址到物理地址转换的硬件。", "内存管理单元（MMU）", 1, "9"],
    ["page table", "记录虚拟页到物理页映射关系与权限信息的数据结构。", "页表", 1, "9"],
    ["page table entry", "页表中的一项，含有效位、物理页号与访问权限位。", "页表项（PTE）", 1, "9"],
    ["page", "把虚拟地址空间按固定大小切分出的连续块。", "页 / 虚拟页", 1, "6,9"],
    ["page frame", "物理内存中与虚拟页对应的定长块。", "页框 / 物理页", 1, "9"],
    ["vpn", "虚拟地址中用于索引页表的虚拟页号字段。", "虚拟页号（VPN）", 0, "9"],
    ["tlb", "快表：缓存近期地址转换结果的高速小型硬件缓存。", "转换检测缓冲区（TLB）", 1, "9"],
    ["page fault", "访问的虚拟页尚未建立有效映射时触发的异常，由内核调入页面。", "缺页", 1, "8,9"],
    ["demand paging", "只在页面真正被访问时才把它调入内存的的策略。", "按需分页", 1, "9"],
    ["swap", "把暂时不用的页面写到磁盘、需要时再读回的机制。", "交换 / 换入换出", 0, "9"],
    ["memory mapping", "把磁盘文件的一段区域与虚拟地址空间的一段区域关联起来。", "内存映射", 1, "9,10"],
    ["mmap", "创建内存映射的系统调用。", "mmap（内存映射调用）", 0, "9"],
    ["copy-on-write", "多个进程先共享同一物理页，直到某进程写入时才复制副本。", "写时复制", 1, "8,9"],
    ["protection bit", "页表项中限制页面可读、可写、可执行的权限位。", "保护位 / 权限位", 0, "9"],
    ["segmentation", "按逻辑段（代码、数据、栈）划分与管理地址空间的方式。", "分段", 0, "7,9"],
    ["multi-level page table", "用多级索引压缩页表体积、只为已用区域建立下级页表。", "多级页表", 1, "9"],
    ["vpn", "虚拟地址中用于索引页表的虚拟页号字段。", "虚拟页号（VPN）", 0, "9"],

    // 第 10 章 系统级 I/O
    ["file descriptor", "进程用来标识一个已打开文件的非负整数。", "文件描述符", 1, "10,11"],
    ["unix i/o", "内核提供的、以读写系统调用为基础的不带缓冲 I/O 接口。", "Unix I/O（不带缓冲的 I/O）", 1, "10"],
    ["standard i/o", "C 标准库提供的、带缓冲的高层 I/O 接口。", "标准 I/O", 1, "1,10"],
    ["stream", "标准 I/O 中面向 FILE 的抽象字节流。", "流", 0, "10,11"],
    ["short count", "read/write 实际传送字节数少于请求字节数的正常情况。", "不足值", 1, "10,11"],
    ["metadata", "描述文件属性（大小、权限、时间等）的数据。", "文件元数据", 0, "10"],
    ["inode", "Unix 文件系统中记录文件元数据与数据块位置的结构。", "索引节点（inode）", 0, "10"],
    ["redirection", "把标准输入或标准输出重新指向另一个文件的 shell 机制。", "重定向", 0, "8,10"],
    ["eof", "表示输入流结束的标志或条件。", "文件结束符（EOF）", 0, "10"],
    ["buffered i/o", "先在数据缓冲区累积、再批量调用系统读写以减少系统调用。", "带缓冲的 I/O", 1, "1,10"],

    // 第 11 章 网络编程
    ["socket", "进程通过网络收发数据的端点抽象，由 IP 地址与端口标识。", "套接字", 1, "11,12"],
    ["client", "主动发起请求、使用服务的一方。", "客户端", 0, "1,11"],
    ["server", "被动等待并响应请求的一方。", "服务器", 0, "1,11"],
    ["ip address", "网络中标识主机的 32 位（IPv4）或 128 位（IPv6）地址。", "IP 地址", 1, "11"],
    ["port", "同一主机上区分不同网络服务进程的 16 位编号。", "端口", 1, "11"],
    ["protocol", "通信双方共同遵守的数据格式与交互规则。", "协议", 1, "1,11"],
    ["tcp", "面向连接、提供可靠字节流服务的传输层协议。", "传输控制协议（TCP）", 1, "11"],
    ["udp", "无连接、以数据报为单位、不保证可靠的传输层协议。", "用户数据报协议（UDP）", 1, "11"],
    ["packet", "网络中按协议封装后传输的数据单元。", "分组 / 数据包", 1, "1,11"],
    ["datagram", "无连接网络中独立寻址、独立传输的数据单元。", "数据报", 0, "11"],
    ["dns", "把域名解析为 IP 地址的分布式命名系统。", "域名系统（DNS）", 0, "11"],
    ["hostname", "便于人记忆的主机名字，经 DNS 映射为 IP 地址。", "主机名", 0, "11"],
    ["http", "Web 客户端与服务器之间请求—响应式的应用层协议。", "超文本传输协议（HTTP）", 1, "11"],
    ["request", "客户端发往服务器、要求某种服务的消息。", "请求", 0, "11"],
    ["response", "服务器返回给客户端的处理结果消息。", "响应", 0, "11"],
    ["uri", "统一资源标识符：用于定位 Web 资源的字符串。", "统一资源标识符（URI）", 0, "11"],
    ["proxy", "代表客户端转发请求、可提供缓存与访问控制的中间服务器。", "代理服务器", 0, "11"],
    ["three-way handshake", "TCP 建立连接时同步序号的三步交互过程。", "三次握手", 0, "11"],
    ["network byte order", "网络协议统一采用的大端字节序。", "网络字节顺序", 0, "2,11"],
    ["listen", "服务器把套接字置为被动监听状态的系统调用。", "listen（监听连接）", 0, "11"],
    ["bind", "把套接字与本地地址、端口关联起来的系统调用。", "bind（绑定地址）", 0, "11"],
    ["accept", "服务器接收一个已完成连接请求的系统调用。", "accept（接受连接）", 0, "11"],
    ["router", "在网络之间转发分组的设备。", "路由器", 0, "1,11"],
    ["ethernet", "广泛使用的局域网链路层技术。", "以太网", 0, "1,11"],

    // 第 12 章 并发编程
    ["mutex", "保证同一时刻只有一个线程进入临界区的同步原语。", "互斥锁", 1, "12"],
    ["semaphore", "用计数器控制可同时进入资源数量的同步原语。", "信号量", 1, "8,12"],
    ["lock", "对共享资源加锁以保证互斥访问的机制。", "锁", 1, "12"],
    ["deadlock", "多个执行流互相等待对方持有的资源而全部无法推进。", "死锁", 1, "12"],
    ["race condition", "程序正确性依赖于多个线程执行先后顺序的情形。", "竞争条件", 1, "8,12"],
    ["critical section", "访问共享变量、必须互斥执行的代码段。", "临界区", 1, "12"],
    ["synchronization", "协调多个执行流执行顺序与共享访问的机制。", "同步", 1, "4,12"],
    ["atomic", "不可分割、不会被其他执行流中途打断的操作。", "原子操作", 1, "12"],
    ["shared variable", "被多个并发执行流共同访问的变量。", "共享变量", 1, "12"],
    ["thread-safe", "被多个线程同时调用仍能给出正确结果的函数性质。", "线程安全", 1, "12"],
    ["reentrant", "可被多个线程同时调用且只使用自身局部状态的函数性质。", "可重入", 1, "8,12"],
    ["producer-consumer", "一方生产数据、另一方消费数据、通过有界缓冲区协作的经典并发模型。", "生产者—消费者模型", 0, "12"],
    ["readers-writers", "多个读者可并发、写者必须独占的经典同步问题。", "读者—写者问题", 0, "12"],
    ["condition variable", "允许线程等待某个条件成立后再继续的同步机制。", "条件变量", 0, "12"],
    ["pthread", "POSIX 线程库：Unix 系统上创建与管理线程的标准接口。", "POSIX 线程（pthread）", 0, "12"],
    ["i/o multiplexing", "用 select/poll/epoll 同时监听多个描述符的事件驱动并发方式。", "I/O 多路复用", 1, "12"],
    ["event-driven", "由事件到达驱动程序推进、而非按固定顺序执行的程序结构。", "事件驱动", 0, "12"],
    ["nonblocking i/o", "读写操作不会因数据未就绪而让线程长期挂起。", "非阻塞 I/O", 0, "12"],
    ["starvation", "某个执行流长期得不到所需资源、一直无法推进。", "饥饿", 0, "12"],
    ["barrier", "要求所有参与线程都到达同一点后才能继续的同步点。", "屏障", 0, "12"]
  ];

  /* ---------- 重点词条的精编中文拓展 ----------
   * 字段：p=音标, rel=相关术语, col=常见搭配, conf=易混概念, ctx=教材语境说明
   */
  var DETAILS = {
    "bit": { p: "/bɪt/", rel: ["字节（byte）", "字长（word size）", "位模式（bit pattern）", "位级运算"], col: ["bit pattern 位模式", "least significant bit 最低有效位", "bit-level operation 位级运算", "set / clear a bit 置位 / 清位"], conf: ["byte（字节）：1 字节固定等于 8 位，教材中地址按字节编址，别把位与字节混用。"], ctx: "第 1、2 章反复强调：系统中所有信息都是一串位，区分它是整数、浮点数还是指令，靠的是“上下文（解释方式）”。" },
    "byte": { p: "/baɪt/", rel: ["位（bit）", "十六进制", "字节序", "按字节编址"], col: ["byte address 字节地址", "byte order 字节顺序", "8-bit byte 8 位字节", "bytes of memory 内存字节"], conf: ["word（字）：字长随机器而变（32 位或 64 位），字节恒为 8 位。"], ctx: "教材把存储器看成“按字节寻址的数组”，第 2 章的字节序、第 3 章的取指与第 6 章的缓存行都以字节为最小单位。" },
    "process": { p: "/ˈprɒses/", rel: ["线程", "上下文切换", "地址空间", "系统调用", "fork"], col: ["process context 进程上下文", "create / terminate a process 创建 / 终止进程", "process ID 进程标识号", "child process 子进程"], conf: ["thread（线程）：进程是资源与地址空间的容器，线程才是执行流；一个进程可含多个线程。", "program（程序）：程序是静态文件，进程是程序的一次动态执行。"], ctx: "第 1 章说进程是“程序运行的假象”（独占 CPU 与内存）；第 8 章用 fork/execve/waitpid 展开；第 12 章把它作为三种并发构造之一。" },
    "thread": { p: "/θred/", rel: ["进程", "互斥锁", "共享变量", "pthread", "并发"], col: ["thread ID 线程标识号", "join / detach a thread 汇合 / 分离线程", "main thread 主线程", "thread-safe 线程安全"], conf: ["process（进程）：线程共享地址空间，切换开销小；进程彼此隔离，切换开销大。"], ctx: "第 12 章把线程作为最常用并发模型：同一进程内多线程共享全局变量，因此引入互斥锁、信号量与竞争条件。" },
    "cache": { p: "/kæʃ/", rel: ["高速缓存行", "缓存命中", "缓存不命中", "局部性", "TLB"], col: ["L1 / L2 / L3 cache 一级 / 二级 / 三级高速缓存", "cache hit / miss 命中 / 不命中", "cache line 缓存行", "cache size 缓存容量"], conf: ["buffer（缓冲）：缓冲多用于平滑速率差，高速缓存的核心目的是利用局部性降低平均访问时间。", "TLB：TLB 缓存的是“地址转换结果”，普通高速缓存存的是数据/指令。"], ctx: "第 1 章先给直觉：越大越慢越便宜，因此用小而快的高速缓存暂存；第 6 章完整展开组相联、标记、替换与写策略；第 9 章的 TLB 是同一思想的另一应用。" },
    "abstraction": { p: "/æbˈstrækʃn/", rel: ["进程", "虚拟内存", "文件", "指令集体系结构", "系统调用"], col: ["level of abstraction 抽象层次", "provide an abstraction 提供抽象", "abstract away details 隐藏细节"], conf: ["virtual memory（虚拟内存）、process（进程）、file（文件）都是本书三大抽象的具体例子，注意区分“抽象”与“具体实现”。"], ctx: "全书主线：指令集是对硬件的抽象，进程是对 CPU/内存的抽象，虚拟内存是对主存与磁盘的抽象，文件是对 I/O 设备的抽象。" },
    "concurrency": { p: "/kənˈkʌrənsi/", rel: ["并行", "线程", "竞争条件", "上下文切换", "I/O 多路复用"], col: ["concurrent flow 并发流", "concurrent programming 并发编程", "logical concurrency 逻辑并发"], conf: ["parallelism（并行）：并发指逻辑上重叠（单核交替也算），并行指物理上同时执行（需多核/多处理器）。"], ctx: "第 1 章区分“并发”与“并行”；第 12 章指出现代系统需要并发来处理多用户、多 I/O 与多核加速。" },
    "parallelism": { p: "/ˈpærəlelɪzəm/", rel: ["并发", "多核", "SIMD 向量指令", "流水线", "阿姆达尔定律"], col: ["instruction-level parallelism 指令级并行", "data parallelism 数据级并行", "parallel execution 并行执行"], conf: ["concurrency（并发）：并发是更宽的概念，并行是并发在硬件上的一种实现方式。"], ctx: "第 1 章列出三个层次的并行：线程级、指令级（流水线）、数据级（SIMD）；第 5 章与第 12 章分别讨论其对性能与正确性的影响。" },
    "two's complement": { p: "/tuːz ˈkɒmplɪmənt/", rel: ["有符号数", "无符号数", "符号位", "溢出", "符号扩展"], col: ["two's complement representation 补码表示", "convert to two's complement 转换为补码", "two's complement addition 补码加法"], conf: ["unsigned（无符号数）：同一串位按无符号解释与按补码解释，数值可能完全不同；C 语言隐式转换常在此埋坑。"], ctx: "第 2 章的核心：最高位带负权，因此 -1 与 UMax 的位模式相同；教材用补码解释整数溢出、类型转换与乘法优化。" },
    "overflow": { p: "/ˌəʊvəˈfləʊ/", rel: ["补码", "无符号数", "符号位", "截断", "缓冲区溢出"], col: ["integer overflow 整数溢出", "arithmetic overflow 算术溢出", "overflow detection 溢出检测"], conf: ["buffer overflow（缓冲区溢出）：前者是数值超出表示范围，后者是写内存越过数组边界，第 3 章的安全漏洞属于后者。"], ctx: "第 2 章讲整数加法溢出后结果“环绕（wrap around）”，并给出无符号与补码溢出的判定条件；第 3 章的缓冲区溢出是另一类问题。" },
    "endianness": { p: "/ˈendiənnəs/", rel: ["小端序", "大端序", "字节", "网络字节顺序", "位模式"], col: ["little-endian machine 小端机器", "byte ordering 字节顺序", "network byte order 网络字节顺序"], conf: ["bit order（位序）：字节序讨论的是“字节之间的排列”，单个字节内部的位顺序不受影响。"], ctx: "第 2 章指出字节序在三种场景会暴露出来：跨网络传输、反汇编字节序列、强制类型转换；第 11 章要求统一转成网络字节顺序。" },
    "floating-point": { p: "/ˈfləʊtɪŋ pɔɪnt/", rel: ["IEEE 754 浮点标准", "尾数", "阶码", "舍入", "精度"], col: ["single / double precision 单精度 / 双精度", "floating-point arithmetic 浮点运算", "floating-point register 浮点寄存器"], conf: ["integer（整数）：整数运算精确且满足结合律，浮点运算有舍入误差，加法不满足结合律，第 5 章优化代码时必须注意。"], ctx: "第 2 章按 IEEE 754 把位模式拆成符号位、阶码、尾数三段，并强调规格化、非规格化、无穷大与 NaN 四类值。" },
    "register": { p: "/ˈredʒɪstə(r)/", rel: ["程序计数器", "栈指针", "寄存器文件", "操作数", "ISA"], col: ["general-purpose register 通用寄存器", "register file 寄存器文件", "save / restore registers 保存 / 恢复寄存器"], conf: ["cache（高速缓存）：寄存器由编译器/汇编显式命名，高速缓存由硬件自动管理，对程序透明。"], ctx: "第 3 章 x86-64 的 16 个通用寄存器是理解汇编的关键；第 4 章则在寄存器文件层面实现 Y86-64 数据通路。" },
    "stack frame": { p: "/stæk freɪm/", rel: ["栈指针", "返回地址", "过程", "被调用者保存寄存器", "缓冲区溢出"], col: ["allocate / deallocate a stack frame 分配 / 释放栈帧", "frame pointer 帧指针", "stack frame layout 栈帧布局"], conf: ["heap（堆）：栈帧随过程调用自动创建与销毁，堆空间需要显式分配与释放。"], ctx: "第 3 章讲过程调用时，栈帧用于保存返回地址、被保存寄存器、局部变量与参数；理解它才能读懂缓冲区溢出攻击。" },
    "pointer": { p: "/ˈpɔɪntə(r)/", rel: ["地址", "数组", "结构体", "内存别名", "虚拟地址"], col: ["pointer arithmetic 指针运算", "dereference a pointer 解引用指针", "null pointer 空指针"], conf: ["address（地址）：指针是有类型的地址值，指针运算的步长由所指类型大小决定。"], ctx: "第 2、3 章把指针还原为“一个地址 + 一种解释”，第 5 章的内存别名问题正因两个指针可能指向同一位置而产生。" },
    "buffer overflow": { p: "/ˈbʌfə ˌəʊvəˈfləʊ/", rel: ["栈帧", "返回地址", "数组", "对齐", "栈破坏攻击"], col: ["bounds checking 边界检查", "overflow the buffer 越界写入", "stack smashing attack 栈破坏攻击"], conf: ["integer overflow（整数溢出）：与数值范围无关，缓冲区溢出是空间越界写，会覆盖相邻栈内容。"], ctx: "第 3 章用 gets 等不带长度检查的函数说明越界写如何覆盖返回地址，并介绍栈随机化、栈保护与可执行代码保护三种防御。" },
    "pipeline": { p: "/ˈpaɪplaɪn/", rel: ["流水段", "冒险", "转发", "停顿", "分支预测", "吞吐量"], col: ["pipeline stage 流水段", "pipeline register 流水线寄存器", "pipeline hazard 流水线冒险"], conf: ["parallelism（并行）：流水线提高的是吞吐量而非单条指令的延迟，这点常被误解。"], ctx: "第 4 章把 Y86-64 拆成取指、译码、执行、访存、写回、更新 PC 六级，并说明增加级数与冒险损失之间的权衡。" },
    "branch prediction": { p: "/brɑːntʃ prɪˈdɪkʃn/", rel: ["条件分支", "流水线", "冒险", "推测执行", "性能优化"], col: ["predict taken / not taken 预测跳转 / 不跳转", "misprediction penalty 预测错误处罚", "branch target 分支目标"], conf: ["conditional branch（条件分支）：前者是硬件对分支结果的猜测机制，后者是指令本身。"], ctx: "第 4 章用预测减少控制冒险；第 5 章进一步建议写出分支可预测的代码以提升实际性能。" },
    "cache hit": { p: "/kæʃ hɪt/", rel: ["缓存不命中", "缓存行", "标记", "相联度", "局部性"], col: ["hit rate 命中率", "hit time 命中时间", "cache hit vs miss 命中与不命中"], conf: ["TLB hit（TLB 命中）：前者指数据/指令在高速缓存中，后者指地址映射在快表中，两者可同时发生或分别缺失。"], ctx: "第 6 章把地址划为标记、组索引、块偏移三段，命中判定分三步：组选择、行匹配、字抽取。" },
    "cache miss": { p: "/kæʃ mɪs/", rel: ["缓存命中", "不命中处罚", "冷不命中", "冲突不命中", "容量不命中", "替换策略"], col: ["miss rate 不命中率", "miss penalty 不命中处罚", "cold / conflict / capacity miss 三类不命中"], conf: ["page fault（缺页）：缓存不命中由硬件处理、代价是几十个周期；缺页由内核处理、代价可达数百万周期。"], ctx: "第 6 章区分强制性（冷）、冲突性、容量性三类不命中，并说明改变相联度、块大小与程序局部性分别影响哪一类。" },
    "locality": { p: "/ləʊˈkæləti/", rel: ["时间局部性", "空间局部性", "步长", "工作集", "存储器山"], col: ["good / poor locality 局部性好 / 差", "reference pattern 访问模式", "stride-1 reference 步长为 1 的访问"], conf: ["temporal / spatial locality（时间 / 空间局部性）：前者讲“同一数据反复用”，后者讲“相邻数据接着用”，是局部性的两种形式。"], ctx: "第 6 章把局部性作为缓存之所以有效的前提；第 5 章的循环交换、分块等优化本质上都在改善局部性。" },
    "relocation": { p: "/ˌriːləʊˈkeɪʃn/", rel: ["目标文件", "符号表", "链接器", "ELF 文件格式", "位置无关代码"], col: ["relocation entry 重定位条目", "relocate a reference 修正引用地址", "PC-relative relocation 相对寻址重定位"], conf: ["symbol resolution（符号解析）：解析负责把引用与定义配对，重定位负责把合并后的地址填回代码。"], ctx: "第 7 章链接分两步：先符号解析，再重定位；重定位条目记录需要修改的位置与计算方式（绝对地址或 PC 相对）。" },
    "symbol": { p: "/ˈsɪmbl/", rel: ["符号表", "全局符号", "外部符号", "强符号", "弱符号", "重定位"], col: ["symbol definition / reference 符号定义 / 引用", "symbol table 符号表", "undefined symbol 未定义符号"], conf: ["identifier（标识符）：标识符是源码里的名字，符号是目标文件中带位置与类型信息的链接实体。"], ctx: "第 7 章按“本模块定义 / 他模块定义 / 仅本模块可见”把符号分为全局、外部与局部三类，并讲解强弱符号规则。" },
    "exception": { p: "/ɪkˈsepʃn/", rel: ["中断", "陷阱", "故障", "异常表", "信号", "系统调用"], col: ["exception handler 异常处理程序", "exception number 异常号", "synchronous / asynchronous exception 同步 / 异步异常"], conf: ["interrupt（中断）：中断是来自外部设备的异步异常；陷阱、故障、终止都是同步异常。", "signal（信号）：信号是内核/进程在软件层通知事件的机制，异常是处理器层事件。"], ctx: "第 8 章用异常表把异常号映射到内核处理程序，并说明四类异常返回行为不同：中断返回下一条、陷阱返回下一条、故障重新执行当前、终止不返回。" },
    "signal": { p: "/ˈsɪɡnəl/", rel: ["异常", "处理程序", "进程", "非局部跳转", "并发"], col: ["send / receive a signal 发送 / 接收信号", "signal handler 信号处理程序", "block / ignore a signal 阻塞 / 忽略信号"], conf: ["exception（异常）：异常由硬件产生并进入内核，信号是内核或进程向进程发出的软件通知。"], ctx: "第 8 章讲信号时强调：相同信号不排队、系统调用可能被中断、信号处理函数必须是可重入且异步信号安全的。" },
    "virtual address": { p: "/ˈvɜːtʃuəl əˈdres/", rel: ["物理地址", "地址转换", "页表", "MMU", "虚拟内存"], col: ["virtual address space 虚拟地址空间", "virtual page number 虚拟页号", "translate an address 转换地址"], conf: ["physical address（物理地址）：程序与汇编里看到的都是虚拟地址，只有主存硬件使用物理地址。"], ctx: "第 3 章的反汇编地址、第 7 章的链接地址、第 9 章的页表索引，谈的都是虚拟地址。" },
    "page table": { p: "/peɪdʒ ˈteɪbl/", rel: ["页表项", "地址转换", "缺页", "TLB", "多级页表", "权限位"], col: ["page table entry 页表项", "page table base register 页表基址寄存器", "multi-level page table 多级页表"], conf: ["TLB（快表）：页表存在主存中，TLB 是缓存其部分条目的硬件；TLB 命中时无需访问页表。"], ctx: "第 9 章的地址转换：MMU 用虚拟页号查页表得到有效位与物理页号，再拼接页内偏移；页表项还承担访问权限与缓存控制。" },
    "page fault": { p: "/peɪdʒ fɔːlt/", rel: ["缺页异常", "按需分页", "页表项", "交换", "工作集", "抖动"], col: ["page fault handler 缺页处理程序", "trigger a page fault 触发缺页", "major / minor page fault 主 / 次缺页"], conf: ["cache miss（缓存不命中）：缓存不命中由硬件补数据；缺页属于故障类异常，由内核选择牺牲页并可能读磁盘。"], ctx: "第 9 章：有效位为 0 即触发缺页，内核调入页面后重新执行那条指令，这正是按需分页与写时复制的基础。" },
    "tlb": { p: "/ˌtiː el ˈbiː/", rel: ["页表", "地址转换", "高速缓存", "虚拟页号", "MMU"], col: ["TLB hit / miss TLB 命中 / 不命中", "TLB entry TLB 项", "flush the TLB 刷新快表"], conf: ["page table（页表）：TLB 是页表的高速缓存副本，容量极小但速度与寄存器级访问接近。"], ctx: "第 9 章把 TLB 当作“地址转换的专用高速缓存”：命中时一次访存即可取数，不命中才需多级页表遍历。" },
    "copy-on-write": { p: "/ˈkɒpi ɒn raɪt/", rel: ["fork", "缺页", "虚拟内存", "页表项", "共享库"], col: ["copy-on-write page 写时复制页", "private copy-on-write mapping 私有写时复制映射"], conf: ["shared library（共享库）：共享库共享的是只读代码段；写时复制共享的是可写页面，直到发生写操作才真正复制。"], ctx: "第 9 章解释 fork 为何高效：父子进程先共享同一物理页并标为只读，任一方写入时触发缺页，内核再复制副本。" },
    "file descriptor": { p: "/faɪl dɪˈskrɪptə(r)/", rel: ["Unix I/O", "标准 I/O", "重定向", "套接字", "不足值"], col: ["open / close a file descriptor 打开 / 关闭文件描述符", "descriptor table 描述符表", "standard input / output 标准输入 / 输出"], conf: ["stream / FILE*（流）：文件描述符是内核层的整数，FILE* 是标准 I/O 库在其之上封装的结构。"], ctx: "第 10 章：0/1/2 分别是标准输入、标准输出、标准错误；第 11 章的套接字同样用文件描述符表示，因此 read/write 可通用。" },
    "socket": { p: "/ˈsɒkɪt/", rel: ["端口", "IP 地址", "TCP", "文件描述符", "客户端—服务器模型"], col: ["socket address 套接字地址", "socket pair 套接字对", "create / bind / listen / accept 创建 / 绑定 / 监听 / 接受"], conf: ["port（端口）：端口只是地址的一部分；套接字是端到端通信的端点，由 IP 地址 + 端口共同唯一标识。"], ctx: "第 11 章把网络看成另一种 I/O 设备：套接字描述符可像文件一样读写，客户端与服务器通过连接套接字对通信。" },
    "mutex": { p: "/mjuːˈteks/", rel: ["临界区", "信号量", "死锁", "共享变量", "线程安全"], col: ["lock / unlock a mutex 加锁 / 解锁互斥锁", "mutex contention 锁竞争", "mutex-protected critical section 受锁保护的临界区"], conf: ["semaphore（信号量）：互斥锁是初始值为 1 的二元信号量特例，语义更简单、只允许持有者解锁。"], ctx: "第 12 章强调“对共享变量的访问必须被同一把锁保护”，并用进度图讲解互斥锁如何排除不安全区域。" },
    "semaphore": { p: "/ˈseməfɔː(r)/", rel: ["互斥锁", "生产者—消费者模型", "读者—写者问题", "同步", "原子操作"], col: ["P / V operation P / V 操作", "binary semaphore 二元信号量", "counting semaphore 计数信号量"], conf: ["mutex（互斥锁）：信号量带计数，常用于资源计数与顺序协调；互斥锁专用于互斥，所有权更明确。"], ctx: "第 12 章用信号量实现生产者—消费者中的缓冲区空/满计数，并说明 P、V 操作必须是原子的。" },
    "deadlock": { p: "/ˈdedlɒk/", rel: ["互斥锁", "信号量", "竞争条件", "饥饿", "同步"], col: ["deadlock avoidance 死锁避免", "lock ordering 加锁顺序", "resource allocation graph 资源分配图"], conf: ["starvation（饥饿）：饥饿是长期拿不到资源但系统仍在推进；死锁是互相等待、谁都无法推进。"], ctx: "第 12 章给出避免死锁的实用规则：所有线程按同一全局顺序获取锁，避免形成循环等待。" },
    "race condition": { p: "/reɪs kənˈdɪʃn/", rel: ["竞争", "互斥锁", "临界区", "共享变量", "原子操作", "同步"], col: ["data race 数据竞争", "race condition detection 竞争检测", "synchronize access 同步访问"], conf: ["race（竞争）：第 8 章的“竞争”泛指结果依赖执行时序；竞争条件特指并发访问共享状态导致正确性出错。"], ctx: "第 12 章用多个线程对同一全局变量做 ++ 的例子说明：看似一条语句，机器级是加载—更新—存储三步，交错执行会丢失更新。" },
    "context switch": { p: "/ˈkɒntekst swɪtʃ/", rel: ["进程", "上下文", "内核模式", "异常", "并发"], col: ["save / restore context 保存 / 恢复上下文", "context switch overhead 切换开销", "switch from kernel to user mode 从内核态返回用户态"], conf: ["mode switch（模式切换）：系统调用会发生用户态↔内核态切换，但不一定切换进程；上下文切换一定换执行流。"], ctx: "第 1、8 章：内核保存当前进程上下文、恢复另一进程上下文，从而制造“每个进程独占 CPU”的假象。" }
  };

  /* ---------- 通用英汉小词典：教材中常见但非专业术语的词 ---------- */
  var GENERAL_DICT = {
    "chapter": "章、章节", "section": "小节、节", "figure": "图、插图", "table": "表格", "example": "例子、示例",
    "exercise": "练习题", "practice problem": "练习题", "solution": "解答、解法", "summary": "小结、总结",
    "value": "值、数值", "range": "范围、区间", "result": "结果", "behavior": "行为、表现",
    "property": "性质、属性", "structure": "结构", "mechanism": "机制", "approach": "方法、途径",
    "technique": "技术、方法", "implementation": "实现", "performance": "性能", "efficiency": "效率",
    "complexity": "复杂度", "constraint": "约束、限制", "requirement": "要求、需求", "assumption": "假设、前提",
    "guarantee": "保证", "observe": "观察、注意到", "illustrate": "说明、图示", "describe": "描述",
    "represent": "表示、代表", "correspond": "对应", "determine": "决定、确定", "depend": "依赖、取决于",
    "refer": "指代、引用", "involve": "涉及", "contain": "包含", "require": "需要、要求",
    "provide": "提供", "allow": "允许", "enable": "使能够", "prevent": "防止", "avoid": "避免",
    "ensure": "确保", "indicate": "表明、指示", "imply": "意味着、隐含", "assume": "假定",
    "define": "定义", "specify": "规定、指明", "compare": "比较", "convert": "转换",
    "transform": "变换、转换", "generate": "生成", "compute": "计算", "evaluate": "求值、评估",
    "measure": "测量", "reduce": "减少、化简", "increase": "增加", "modify": "修改",
    "extend": "扩展", "combine": "合并、组合", "separate": "分离", "distinguish": "区分",
    "identify": "识别、确定", "allocate": "分配", "release": "释放", "initialize": "初始化",
    "terminate": "终止", "execute": "执行", "invoke": "调用", "return": "返回",
    "store": "存储、存放", "load": "加载、装入", "fetch": "取指、取回", "transfer": "传送、转移",
    "copy": "复制", "access": "访问、存取", "manipulate": "操作、处理", "interpret": "解释",
    "resolve": "解析、解决", "detect": "检测", "handle": "处理", "propagate": "传播、传递",
    "restore": "恢复", "preserve": "保留、保存", "maintain": "维护、保持", "verify": "验证",
    "validate": "校验、确认", "assign": "赋值、分配", "declare": "声明", "initialize": "初始化",
    "however": "然而、不过", "therefore": "因此", "thus": "因而、这样", "whereas": "而、然而",
    "unless": "除非", "although": "尽管", "since": "因为；自从", "while": "当……时；虽然",
    "respective": "各自的、分别的", "corresponding": "相应的、对应的", "adjacent": "相邻的",
    "arbitrary": "任意的", "explicit": "显式的、明确的", "implicit": "隐式的、隐含的",
    "concise": "简洁的", "subtle": "细微的、不易察觉的", "negligible": "可忽略的",
    "significant": "重要的、显著的", "substantial": "相当大的", "considerable": "相当多的",
    "eventually": "最终", "typically": "通常、一般", "generally": "一般地", "roughly": "大致",
    "precisely": "精确地", "approximately": "近似地", "simultaneously": "同时地",
    "sequentially": "顺序地、依次地", "consecutive": "连续的", "subsequent": "随后的",
    "previous": "先前的", "prior": "在……之前的", "latter": "后者", "former": "前者",
    "granularity": "粒度", "bottleneck": "瓶颈", "bound": "界限、上限；绑定",
    "offset": "偏移量", "index": "索引、下标", "field": "字段、域", "header": "头部、首部",
    "payload": "有效载荷", "sequence": "序列、顺序", "ordering": "顺序、排序",
    "diagram": "示意图、图", "notation": "记法、表示法", "convention": "约定、惯例",
    "schematic": "示意图", "primitive": "原语、基本操作", "semantics": "语义",
    "syntax": "语法", "statement": "语句、陈述", "expression": "表达式", "variable": "变量",
    "constant": "常量", "parameter": "参数", "argument": "实参、参数", "scope": "作用域、范围",
    "state": "状态", "transition": "转换、状态转移", "event": "事件", "trigger": "触发",
    "sequence": "序列", "pattern": "模式、规律", "layout": "布局、排布",
    "boundary": "边界", "interval": "区间、间隔", "fraction": "小数、分数",
    "magnitude": "数量级、大小", "signed": "有符号的", "carry": "进位",
    "consistent": "一致的", "equivalent": "等价的", "transparent": "透明的、对程序不可见的",
    "portable": "可移植的", "robust": "健壮的", "efficient": "高效的",
    "hierarchy": "层次结构", "level": "层次、级别", "layer": "层", "component": "部件、组件",
    "device": "设备", "controller": "控制器", "adapter": "适配器", "interface": "接口",
    "instruction set": "指令集", "execution": "执行", "iteration": "迭代",
    "recursive": "递归的", "static": "静态的", "dynamic": "动态的",
    "global": "全局的", "local": "局部的", "private": "私有的", "shared": "共享的",
    "volatile": "易失的；volatile 关键字", "resident": "常驻的", "persistent": "持久的",
    "consecutive": "连续的", "contiguous": "连续的（内存）", "alignment": "对齐",
    "sequence": "序列", "simultaneous": "同时的", "mutual": "相互的", "exclusive": "互斥的、独占的"
  };

  /* ---------- 中文资料链接 ---------- */
  var CANONICAL_LINKS = {
    "endianness": [{ name: "阮一峰：理解字节序（中文）", url: "https://www.ruanyifeng.com/blog/2016/11/byte-order.html" }],
    "little-endian": [{ name: "阮一峰：理解字节序（中文）", url: "https://www.ruanyifeng.com/blog/2016/11/byte-order.html" }],
    "big-endian": [{ name: "阮一峰：理解字节序（中文）", url: "https://www.ruanyifeng.com/blog/2016/11/byte-order.html" }],
    "network byte order": [{ name: "阮一峰：理解字节序（中文）", url: "https://www.ruanyifeng.com/blog/2016/11/byte-order.html" }],
    "assembly": [{ name: "阮一峰：汇编语言入门教程（中文）", url: "https://www.ruanyifeng.com/blog/2018/01/assembly-language-primer.html" }],
    "assembly code": [{ name: "阮一峰：汇编语言入门教程（中文）", url: "https://www.ruanyifeng.com/blog/2018/01/assembly-language-primer.html" }],
    "machine code": [{ name: "阮一峰：汇编语言入门教程（中文）", url: "https://www.ruanyifeng.com/blog/2018/01/assembly-language-primer.html" }],
    "isa": [{ name: "阮一峰：汇编语言入门教程（中文）", url: "https://www.ruanyifeng.com/blog/2018/01/assembly-language-primer.html" }],
    "disassembly": [{ name: "阮一峰：汇编语言入门教程（中文）", url: "https://www.ruanyifeng.com/blog/2018/01/assembly-language-primer.html" }],
    "process": [{ name: "阮一峰：进程与线程的一个简单解释（中文）", url: "https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html" }],
    "thread": [{ name: "阮一峰：进程与线程的一个简单解释（中文）", url: "https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html" }],
    "context switch": [{ name: "阮一峰：进程与线程的一个简单解释（中文）", url: "https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html" }],
    "concurrency": [{ name: "阮一峰：进程与线程的一个简单解释（中文）", url: "https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html" }],
    "parallelism": [{ name: "阮一峰：进程与线程的一个简单解释（中文）", url: "https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html" }],
    "socket": [{ name: "阮一峰：互联网协议入门（一）（中文）", url: "https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html" }],
    "protocol": [{ name: "阮一峰：互联网协议入门（一）（中文）", url: "https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html" }],
    "ip address": [{ name: "阮一峰：互联网协议入门（一）（中文）", url: "https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html" }],
    "packet": [{ name: "阮一峰：互联网协议入门（一）（中文）", url: "https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html" }],
    "tcp": [{ name: "阮一峰：互联网协议入门（一）（中文）", url: "https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html" }]
  };

  /* 把术语表展开为以单词为键的索引 */
  var TERM_MAP = {};
  TERMS.forEach(function (t) {
    if (!TERM_MAP[t[0]]) {
      TERM_MAP[t[0]] = {
        word: t[0], def: t[1], term: t[2], core: !!t[3],
        chapters: t[4].split(",").map(Number)
      };
    }
  });

  function chapterById(id) {
    for (var i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].id === Number(id)) return CHAPTERS[i];
    return null;
  }
  function chapterName(id) {
    var c = chapterById(id);
    return c ? ("第 " + c.id + " 章 " + c.name) : "未指定章节";
  }
  function chapterHint(id) {
    var c = chapterById(id);
    return c ? c.hint : "尚未指定章节，可在录入时选择该词出现的章，以便生成更贴合教材的语境说明。";
  }
  function termZh(w) {
    return TERM_MAP[w] ? TERM_MAP[w].term : w;
  }
  function termDef(w) {
    return TERM_MAP[w] ? TERM_MAP[w].def : "";
  }
  function termsOfChapter(chapterId) {
    return Object.keys(TERM_MAP).filter(function (w) {
      return TERM_MAP[w].chapters.indexOf(Number(chapterId)) >= 0;
    });
  }
  function similarTerms(w) {
    var base = w.replace(/[^a-z0-9]/g, "");
    return Object.keys(TERM_MAP)
      .filter(function (x) { return x !== w; })
      .map(function (x) {
        var s = x.replace(/[^a-z0-9]/g, "");
        var n = 0, lim = Math.min(base.length, s.length);
        for (var i = 0; i < lim && base[i] === s[i]; i++) n++;
        return { w: x, n: n };
      })
      .filter(function (o) { return o.n >= 4; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 3)
      .map(function (o) { return o.w; });
  }
  function cleanQuery(s) {
    return String(s || "")
      .replace(/[（(].*?[）)]/g, "")
      .replace(/\/.*$/, "")
      .replace(/\s+/g, " ")
      .trim() || "计算机";
  }
  /* 拓展链接：一律优先指向中国网站上的中文计算机资料 */
  function buildLinks(word, term, chapterId) {
    var q = cleanQuery(term);
    var e = encodeURIComponent;
    var links = (CANONICAL_LINKS[word] || []).slice();
    links.push({ name: "百度百科 · " + q, url: "https://baike.baidu.com/item/" + e(q) });
    links.push({ name: "知乎 · " + q + " 中文讨论", url: "https://www.zhihu.com/search?type=content&q=" + e(q + " 计算机") });
    links.push({ name: "CSDN · " + q + " 中文技术文章", url: "https://so.csdn.net/so/search?q=" + e(q + " 深入理解计算机系统") });
    links.push({ name: "博客园 · " + q + " 中文笔记", url: "https://zzk.cnblogs.com/s?w=" + e(q) });
    links.push({ name: "中国大学MOOC · 中文课程", url: "https://www.icourse163.org/search.htm?search=" + e("计算机系统 " + q) });
    links.push({ name: "菜鸟教程 · 中文编程教程", url: "https://www.runoob.com/" });
    return links;
  }

  return {
    CHAPTERS: CHAPTERS, TERMS: TERMS, TERM_MAP: TERM_MAP, DETAILS: DETAILS,
    GENERAL_DICT: GENERAL_DICT,
    chapterById: chapterById, chapterName: chapterName, chapterHint: chapterHint,
    termZh: termZh, termDef: termDef, termsOfChapter: termsOfChapter,
    similarTerms: similarTerms, buildLinks: buildLinks, cleanQuery: cleanQuery
  };
})();
