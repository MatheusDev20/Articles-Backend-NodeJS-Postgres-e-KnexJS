module.exports = app => {
    const {existOrError, notExistOrError} = app.api.validacao

    const save = (req,res) => {
        const category = {...req.body}
        // verificando se veio um id da url de req
        if(req.params.id) {
            category.id = req.params.id
        }
        // validações 
        try {
            existOrError(category.name, 'Name not found')

        } catch(msg) {
            return res.status(400).send(msg)
        }
        // verifica se o id foi setado, se sim da um update.
        if(category.id) {
            app.db('categories')
            .update(category)
            .where({id: category.id})
            .then(()=> res.status(204).send())
            .catch(err=> res.status(500).send(err))
        // se não, ele da um insert
        } else {
            app.db('categories')
            .insert(category)
            .then(()=> res.status(204).send())
            .catch(err=> res.status(500).send(err))
        }
    }
        const remove = async (req,res) => {
            try {
 
                existOrError(req.params.id, 'Codigo não informado')
                // verificando se o id da categoria que vc quer remover possui uma categoria filha
                const subCategory = await app.db('categories')
                .where({parentId: req.params.id})
                notExistOrError(subCategory, 'Categoria possui subcategorias')

                const articles = await app.db('articles')
                .where({categoryId: req.params.id})
                notExistOrError(articles, 'Categoria possui artigos associados')

                const rowsDeleted = await app.db('categories')
                .where({id: req.params.id}).del()
                existOrError(rowsDeleted, 'Categoria não encontrada')
                res.status(204).send()
            }
            catch(msg) {
                res.status(400).send(msg)
            }
        }
                // Funções para relacionar cateogorias filhas e pais ver dps.
            const withPath = categories => {
                const getParent = (categories, parentId) => {
                    const parent = categories.filter(parent => parent.id === parentId)
                    return parent.length ? parent[0] : null
                }

                const categoriesWithPath = categories.map(category => {
                    let path = category.name
                    let parent = getParent(categories, category.parentId)

                    while(parent) {
                        path = `${parent.name} > ${path}`
                        parent = getParent(categories,parent.parentId)
                    }
                    return {...category, path}
                })
                categoriesWithPath.sort((a,b)=> {
                    if(a.path < b.path) return -1
                    if(a.path > b.path) return 
                    return 0;
                })
                return categoriesWithPath;
            }
                const get = (req,res) => {
                    app.db('categories')
                    .then(categories => res.json(withPath(categories)))
                    .catch(err => res.status(500).send(err))
                }
                const getById = (req,res) => {
                    app.db('categories')
                    .first()
                    .then(category => res.json(category))
                    .catch(err => res.status(500).send(err))
                }

                const toTree = (categories, tree) => {
                    if(!tree) tree = categories.filter( c=> !c.parentId)
                        tree = tree.map(parentNode => {
                            const isChild = node => node.parentId = parentNode.id
                            parentNode.children = toTree(categories, categories.filter(isChild))
                            return parentNode
                        })
                        return tree
                    }
                const getTree = (req,res) => {
                    app.db('categories')
                        .then(categories => res.json(toTree(categories)))
                        .catch( err => res.status(500).send(err))
                }

                return {save, remove, get, getById, getTree}
  
}