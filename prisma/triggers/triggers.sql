-- CREATE FUNCTION update_content_version() RETURNS trigger AS $BODY$
--     DECLARE max_version INTEGER;

--     BEGIN
--         SELECT COALESCE((SELECT MAX(a.version) FROM "Content" a WHERE a."parentArticleId" = NEW."parentArticleId"), 0) INTO max_version;
--         NEW."version" = max_version + 1;

--         RETURN NEW;
--     END;
-- $BODY$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_content_version BEFORE INSERT ON "Content" FOR EACH ROW EXECUTE PROCEDURE update_content_version();

-- 

CREATE FUNCTION update_article_version() RETURNS trigger AS $BODY$
    DECLARE max_version INTEGER;

    BEGIN
        SELECT COALESCE((SELECT MAX(a.version) FROM "ArticleVersion" a WHERE a."articleLanguageId" = NEW."articleLanguageId"), 0) INTO max_version;
        NEW."version" = max_version + 1;

        RETURN NEW;
    END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_version BEFORE INSERT ON "ArticleVersion" FOR EACH ROW EXECUTE PROCEDURE update_article_version();