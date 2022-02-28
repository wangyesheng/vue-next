export const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1, // 1左移一位 00000010 1*2^1 + 0*2^0
    STATEFUL_COMPONENT = 1 << 2,   // 1左移两位 00000100 1*2^2 + 0*2^1 +  0*2^0
    TEXT_CHILDREN = 1 << 3,        // 1左移三位 00001000 1*2^3 0*2^2 + 0*2^1 +  0*2^0
    ARRAY_CHILDREN = 1 << 4,
    SLOTS_CHILDREN = 1 << 5,
    TELEPORT = 1 << 6,
    SUSPENSE = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT // 00000110  1*2^2 + 1*2^1 +  0*2^0
}