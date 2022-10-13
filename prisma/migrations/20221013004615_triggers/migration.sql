CREATE FUNCTION update_article_version() RETURNS trigger AS $BODY$
    DECLARE max_version INTEGER;

    BEGIN
        SELECT COALESCE((SELECT MAX(a.version) FROM "ArticleVersion" a WHERE a."articleLanguageCode" = NEW."articleLanguageCode"), 0) INTO max_version;
        NEW."version" = max_version + 1;

        RETURN NEW;
    END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_version BEFORE INSERT ON "ArticleVersion" FOR EACH ROW EXECUTE PROCEDURE update_article_version();