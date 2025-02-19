import { describe, expect, it } from 'vitest'
import { generateProjectCodeAuths } from '../../src/core/authConfigGenerator'

const mockData = {
  projectPageCodeAuths: {
    'src/views/user/index.vue': [
      {
        code: 'user-add',
        label: 'i18n.t("user.add")',
      },
      {
        code: 'user-edit',
        label: 'i18n.t("user.edit")',
      },
      {
        code: 'user-delete',
        label: 'i18n.t("user.delete")',
      },
    ],
    'src/views/role/index.vue': [
      {
        code: 'role-add',
        label: 'i18n.t("role.add")',
      },
      {
        code: 'role-edit',
        label: 'i18n.t("role.edit")',
      },
    ],
    'src/components/UserForm.vue': [],
    'src/components/RoleForm.vue': [],
    'src/utils/index.ts': [],
  },

  projectDependencyGraph: {
    'src/views/user/index.vue': [
      'src/components/UserForm.vue',
      'src/utils/index.ts',
    ],
    'src/views/role/index.vue': [
      'src/components/RoleForm.vue',
      'src/utils/index.ts',
    ],
    'src/components/UserForm.vue': [
      'src/utils/index.ts',
    ],
    'src/components/RoleForm.vue': [
      'src/utils/index.ts',
    ],
    'src/utils/index.ts': [],
  },

  projectRouteItems: {
    'src/views/user/index.vue': {
      name: 'user',
      path: '/user',
      label: '用户管理',
    },
    'src/views/role/index.vue': {
      name: 'role',
      path: '/role',
      label: '角色管理',
    },
    'src/components/UserForm.vue': {
      name: '',
      path: '',
      label: '',
    },
    'src/components/RoleForm.vue': {
      name: '',
      path: '',
      label: '',
    },
  },
}

describe('generateProjectCodeAuths', () => {
  it('应该生成正确的权限映射', () => {
    const projectAuths = new Map()
    const projectDependencyGraph = new Map()
    const projectRouteItems = new Map()
    Object.entries(mockData.projectPageCodeAuths).forEach(([key, value]) => {
      projectAuths.set(key, value)
    })
    Object.entries(mockData.projectDependencyGraph).forEach(([key, value]) => {
      projectDependencyGraph.set(key, value)
    })
    Object.entries(mockData.projectRouteItems).forEach(([key, value]) => {
      projectRouteItems.set(key, value)
    })

    const result = generateProjectCodeAuths(
      projectAuths,
      projectDependencyGraph,
      projectRouteItems,
    )

    expect(JSON.stringify(Object.fromEntries(result), null, 2)).toMatchInlineSnapshot(`
      "{
        "src/views/user/index.vue": {
          "routeItem": {
            "name": "user",
            "path": "/user",
            "label": "用户管理"
          },
          "codeItems": [
            {
              "code": "user-add",
              "label": "i18n.t(\\"user.add\\")"
            },
            {
              "code": "user-edit",
              "label": "i18n.t(\\"user.edit\\")"
            },
            {
              "code": "user-delete",
              "label": "i18n.t(\\"user.delete\\")"
            }
          ]
        },
        "src/views/role/index.vue": {
          "routeItem": {
            "name": "role",
            "path": "/role",
            "label": "角色管理"
          },
          "codeItems": [
            {
              "code": "role-add",
              "label": "i18n.t(\\"role.add\\")"
            },
            {
              "code": "role-edit",
              "label": "i18n.t(\\"role.edit\\")"
            }
          ]
        }
      }"
    `)
  })
})
