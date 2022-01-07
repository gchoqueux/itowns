let gui_loaded;

function setPotreeGui(view) {
    // ######### tools menu #########
    const mTools = $("#menu_tools").next();
    mTools.show();

    // ######### Hide tools #########
    const tools = $('#tools');
    tools.find("img[data-i18n$='angle_measurement']").hide();
    tools.find("img[data-i18n$='circle_measurement']").hide();
    tools.find("img[data-i18n$='volume_measurement']").hide();
    tools.find("img[data-i18n$='annotation']").hide();
    tools.find("img[data-i18n$='Azimuth']").hide();
    // ######### tools menu : Hide clipping and navigation #########
    mTools.children().slice(3).hide();

    // ######### menu scene #########
    $("#menu_scene").next().show();

    // ######### appearance menu #########
    const mAppearance = $("#menu_appearance").next();
    mAppearance.show();
    mAppearance.find('.pv-menu-list').children().slice(1).hide();

    // #########  Menu about  #########
    $('#menu_about').next().show();
    const menu_about = $('#menu_about').next().find('.pv-menu-list')
    menu_about.children().hide();

    const about_text = `<b>Lidar HD © IGN - 2022<br> iTowns 2.37 - Potree 1.9</b>`;
    const about_content = $(`<li>${about_text}</li>`);
    menu_about.append(about_content);

    gui_loaded = $.get('./html/language.html').then((data_language) => {
        // #########  Rebuild language selection  #########
        const elLanguages = $('#potree_languages');
        elLanguages.empty();
        elLanguages.append($(data_language))
        const button_lg = $("#language_options_show");
        button_lg.selectgroup();

        button_lg.find("input").click( (e) => {
            potreeViewer.setLanguage(e.target.value);
        });

        button_lg.find(`input[value=fr]`).trigger("click");
        const button_mode = $('#button_mode');
        button_mode.i18n();

        // #########  add expert and simple menu  #########
        const potree_menu = $('#potree_menu');

        return $.get('./html/simple_mode.html').then((data) => {
            const contentNoobs = $(data);
            potree_menu.prepend(contentNoobs)
            contentNoobs.i18n();
            function toggleMenu() {
                let header = $(this);
                let content = $(this).next();

                header.click(() => {
                    content.slideToggle();
                });
            }
            contentNoobs.filter('h3').each(toggleMenu);

            $('#menu_about').attr('all_mode', 'true');

            const expert_headers = potree_menu.children('h3').not('[all_mode]').not('[simple_mode]');
            const simple_headers = potree_menu.children('h3[simple_mode]');

            function toggle() {
                $(this).toggle();
                $(this).next().hide();
            }

            simple_headers.each(toggle);

            const menu_attributs = $('#menu_attri');

            const change_mode = () => {
                expert_headers.each(toggle);
                simple_headers.each(toggle);
                if (menu_attributs.is(":visible")) {
                    button_mode.attr('data-i18n', 'settings.mode_expert');
                    menu_attributs.next().show();
                } else {
                    button_mode.attr('data-i18n', 'settings.mode_simple');
                }
                button_mode.i18n();
            };

            change_mode();
            const content_coordinates = $('#menu_coord').next().children('li');
            const dataTable = $('#tcoord');

            const coord = new itowns.Coordinates('EPSG:4326');
            const coord_cam = new itowns.Coordinates('EPSG:4326');

            view.addEventListener(itowns.VIEW_EVENTS.CAMERA_MOVED, (event) => {
                event.coord.as('EPSG:4326', coord);
                coord_cam.setFromVector3(view.camera.camera3D.position);
                coord_cam.crs = view.referenceCrs;
                coord_cam.as('EPSG:4326', coord_cam)

                $('#tlo').text(`${coord.x.toFixed(4)}°`);
                $('#tla').text(`${coord.y.toFixed(4)}°`);
                $('#tal').text(`${coord.z.toFixed(1)} m`);

                $('#clo').text(`${coord_cam.x.toFixed(4)}°`);
                $('#cla').text(`${coord_cam.y.toFixed(4)}°`);
                $('#cal').text(`${coord_cam.z.toFixed(1)} m`);
            });

            button_mode.click(change_mode);
        });
    });
}

function addAttributesGui(pointcloud) {
    gui_loaded.then(() => {
        const attributes = pointcloud.pcoGeometry.pointAttributes.attributes;

        let options = [];

        options.push(...attributes.map(a => a.name));

        const blacklist = [
            "POSITION_CARTESIAN",
            "position",
        ];

        options = options.filter(o => !blacklist.includes(o));

        let attributeSelection = $('#optMaterial');
        for(let option of options){
            let elOption = $(`<option>${option}</option>`);
            attributeSelection.append(elOption);
        }

        let material = pointcloud.material;
        let updateMaterialPanel = (event, ui) => {
            let selectedValue = attributeSelection.selectmenu().val();
            material.activeAttributeName = selectedValue;
        };

        attributeSelection.selectmenu({change: updateMaterialPanel});
    });
}

function addButtonExport() {
    let tree = $('#jstree_scene');
    tree.on("select_node.jstree", (e, data) => {
        let object = data.node.data;
        const measurement_area = $('#measurement_area');
        const panelArea = $('#measurement_area').parent();
        const exportButton = panelArea.find("#area_export")[0];
        if(!exportButton && measurement_area[0]) {
            const content = $(`
                <li style="display: grid; grid-template-columns: auto auto; grid-column-gap: 5px; margin-top: 10px">
                        <input id="area_export" type="button" value="export"/>
                </li>
            `);
            panelArea.append(content);

            panelArea.find("#area_export").click(() => {
                if (object.onExport) {
                    object.onExport();
                }
            });
        }
    });
}
